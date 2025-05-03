import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Bill from '../models/Bill.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';


export const register = async (req, res) => {
  const { name, email, password } = req.body;
    
  try {
      // Input validation
      if (!name || !email || !password) {
          return res.status(400).json({ 
              success: false,
              message: 'All fields (name, email, password) are required' 
          });
      }

      // Normalize and validate email
      const normalizedEmail = email.toLowerCase().trim();
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(normalizedEmail)) {
          return res.status(400).json({
              success: false,
              message: 'Please provide a valid email address'
          });
      }

      // Check for existing user
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
          return res.status(409).json({
              success: false,
              message: `User with email ${normalizedEmail} already exists`
          });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          // accounts will be empty by default
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: User._id },  // Keep using 'id' (no underscore)
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return response without sensitive data
      const userResponse = {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
      };

      return res.status(201).json({
          success: true,
          message: 'User created successfully',
          user: userResponse,
          token
      });

  } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle duplicate key errors (even though we checked earlier)
      if (error.code === 11000) {
          return res.status(409).json({
              success: false,
              message: 'Email already exists'
          });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
          const errors = {};
          Object.keys(error.errors).forEach(key => {
              errors[key] = error.errors[key].message;
          });
          return res.status(400).json({
              success: false,
              message: 'Validation failed',
              errors
          });
      }

      return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
      });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both email and password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials' // Generic message for security
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials' // Generic message for security
            });
        }

        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
      );

      // Store the token in the user's tokens array
      user.tokens.push({ token });
      await user.save();

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            accounts: user.accounts
        };

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token ,
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
  try {
      // Remove the current token from the user's tokens array
      req.user.tokens = req.user.tokens.filter(tokenObj => {
          return tokenObj.token !== req.token;
      });

      await req.user.save();
      
      res.status(200).json({ 
          success: true,
          message: 'Logout successful' 
      });
      
  } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
          success: false,
          message: 'Internal server error' 
      });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Create response without sensitive data
    const userResponse = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      balance: req.user.balance, // Added balance
      createdAt: req.user.createdAt,
      accounts: req.user.accounts
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateBalance = async (req, res) => {
  const { balance } = req.body;

  try {
    // Validate input
    if (typeof balance !== 'number') {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be a number' 
      });
    }

    // Update balance
    req.user.balance = balance;
    await req.user.save();
    
    // Return updated balance
    res.status(200).json({
      success: true,
      message: 'Balance updated successfully',
      balance: req.user.balance
    });
    
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};
export const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'balance']; // Added 'balance'
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    // Process updates
    for (const update of updates) {
      if (update === 'password') {
        req.user[update] = await bcrypt.hash(req.body[update], 8);
      } else {
        req.user[update] = req.body[update];
      }
    }
    
    await req.user.save();
    
    // Create response without sensitive data
    const userResponse = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      balance: req.user.balance, // Include balance in response
      createdAt: req.user.createdAt
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ 
      error: 'Update failed',
      details: error.message 
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    await req.user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get User Info (including name and balance)
    const user = await User.findById(userId).select('name balance');

    // 2. Get 3 Upcoming Bills (ordered by dueDate)
    const upcomingBills = await Bill.find({ userId, isPaid: false })
      .sort({ dueDate: 1 })
      .limit(3);

    // 3. Get 5 Recent Transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // 4. Expense Breakdown (group by category)
    const expenseBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0
        }
      }
    ]);
    
    // 5. Get All Goals
    const goals = await Goal.find({ userId });

    // 6. Target Achieved (currentAmount >= targetAmount)
    const targetAchieved = await Goal.find({
      userId,
      $expr: { $gte: ['$currentAmount', '$targetAmount'] }
    });

    // 7. This Month's Target
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const monthlyGoals = await Goal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          targetDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalTargetAmount: { $sum: '$targetAmount' }
        }
      }
    ]);

    res.status(200).json({
      username: user.name, // Added username
      balance: user.balance,
      upcomingBills,
      recentTransactions,
      expenseBreakdown,
      goals,
      targetAchieved,
      thisMonthTarget: monthlyGoals[0]?.totalTargetAmount || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};