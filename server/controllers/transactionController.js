
import Transaction from '../models/transaction.js';
import Account from '../models/account.js';

export const createTransaction = async (req, res) => {
  try {
    if (!req.body.description || !req.body.amount || !req.body.category || !req.body.type) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields (description, amount, category, type)' 
      });
    }

    // Validate amount is a number
    if (isNaN(req.body.amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number'
      });
    }

    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });

    await transaction.save();

    // Update account balance if account is specified
    if (req.body.accountId) {
      const account = await Account.findOne({
        _id: req.body.accountId,
        userId: req.user._id // Ensure account belongs to user
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found or does not belong to user'
        });
      }

      account.balance += req.body.type === 'income' ? req.body.amount : -req.body.amount;
      await account.save();
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

import moment from 'moment';


export const getTransactions = async (req, res) => {
  try {
    const match = { userId: req.user._id };
    const sort = {};
    
    // Existing filtering logic
    if (req.query.accountId) match.accountId = req.query.accountId;
    if (req.query.type) match.type = req.query.type;
    if (req.query.category) match.category = req.query.category;
    
    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      match.date = {};
      if (req.query.startDate) match.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) match.date.$lte = new Date(req.query.endDate);
    }

    // Sorting
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.date = -1; // Default sort by date descending
    }

    // Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(match)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Transaction.countDocuments(match);

    // Format dates to dd mmm yyyy (e.g., "02 May 2025")
    const formattedTransactions = transactions.map(transaction => {
      return {
        ...transaction.toObject(),
        date: moment(transaction.date).format('DD MMM YYYY'),
        // Keep original ISO date if needed for sorting/filtering
        isoDate: transaction.date  
      };
    });

    res.json({
      success: true,
      count: formattedTransactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTransaction = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'amount', 'category', 'merchant', 'date', 'type', 'accountId'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid updates!',
      allowedUpdates
    });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied'
      });
    }

    // Handle account balance changes if amount or type is updated
    if (updates.includes('amount') || updates.includes('type')) {
      // Revert old transaction impact if it had an account
      if (transaction.accountId) {
        const oldAccount = await Account.findOne({
          _id: transaction.accountId,
          userId: req.user._id
        });
        
        if (oldAccount) {
          oldAccount.balance += transaction.type === 'income' 
            ? -transaction.amount 
            : transaction.amount;
          await oldAccount.save();
        }
      }

      // Apply updates
      updates.forEach(update => transaction[update] = req.body[update]);

      // Apply new transaction impact if account exists
      if (transaction.accountId) {
        const newAccount = await Account.findOne({
          _id: transaction.accountId,
          userId: req.user._id
        });

        if (!newAccount) {
          return res.status(404).json({
            success: false,
            message: 'Account not found or does not belong to user'
          });
        }

        newAccount.balance += transaction.type === 'income' 
          ? transaction.amount 
          : -transaction.amount;
        await newAccount.save();
      }
    } else {
      // For non-amount/type updates
      updates.forEach(update => transaction[update] = req.body[update]);
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
};

export const getExpenseBreakdown = async (req, res) => {
  try {
    // Get all expense transactions for the user
    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense'
    });

    // Calculate total expenses
    const totalExpenses = transactions.reduce(
      (sum, transaction) => sum + transaction.amount, 0
    );

    // Group by category and calculate amounts
    const categoryMap = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap[category]) {
        categoryMap[category] = {
          amount: 0,
          percentage: 0
        };
      }
      categoryMap[category].amount += transaction.amount;
    });

    // Calculate percentages
    Object.keys(categoryMap).forEach(category => {
      categoryMap[category].percentage = Math.round(
        (categoryMap[category].amount / totalExpenses) * 100
      );
    });

    // Format the response
    const breakdown = Object.keys(categoryMap).map(category => {
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: categoryMap[category].amount.toFixed(2),
        percentage: categoryMap[category].percentage
      };
    });

    res.json({
      success: true,
      totalExpenses: totalExpenses.toFixed(2),
      breakdown
    });

  } catch (error) {
    console.error('Get expense breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate expense breakdown'
    });
  }
};
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied'
      });
    }

    // Revert transaction impact on account balance if account exists
    if (transaction.accountId) {
      const account = await Account.findOne({
        _id: transaction.accountId,
        userId: req.user._id
      });

      if (account) {
        account.balance += transaction.type === 'income' 
          ? -transaction.amount 
          : transaction.amount;
        await account.save();
      }
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      transaction
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};