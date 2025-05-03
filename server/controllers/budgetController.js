import Budget from '../models/budget.js';

export const createBudget = async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      userId: req.user._id
    });
    await budget.save();
    res.status(201).send(budget);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getBudgets = async (req, res) => {
  try {
    const match = { userId: req.user._id };
    
    if (req.query.category) {
      match.category = req.query.category;
    }
    
    if (req.query.period) {
      match.period = req.query.period;
    }
    
    const budgets = await Budget.find(match);
    res.send(budgets);
  } catch (error) {
    res.status(500).send();
  }
};

export const getBudget = async (req, res) => {
  res.send(req.resource);
};

export const updateBudget = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['category', 'amount', 'period'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => req.resource[update] = req.body[update]);
    await req.resource.save();
    res.send(req.resource);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const deleteBudget = async (req, res) => {
  try {
    await req.resource.remove();
    res.send(req.resource);
  } catch (error) {
    res.status(500).send();
  }
};

export const getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    const summary = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount;
      return acc;
    }, {});
    
    res.send(summary);
  } catch (error) {
    res.status(500).send();
  }
};