import Goal from '../models/Goal.js';
import moment from 'moment';

export const createGoal = async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.user._id
    });
    await goal.save();
    res.status(201).send(goal);
  } catch (error) {
    res.status(400).send(error);
  }
};

const calculateMetrics = (goals) => {
  let totalMonthlyTarget = 0;
  let targetAchievedThisMonth = 0;
  let totalActiveGoals = 0;
  let currentMonthTargetAmount = 0;
  let currentMonthAchievedAmount = 0;

  const currentMonth = moment().month();
  const currentYear = moment().year();

  const enhancedGoals = goals.map(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const isAchieved = goal.currentAmount >= goal.targetAmount;
    let monthlyTarget = 0;
    let achievedThisMonth = false;

    currentMonthTargetAmount += goal.targetAmount;

    if (isAchieved) {
      const achievedMonth = moment(goal.updatedAt).month();
      const achievedYear = moment(goal.updatedAt).year();
      
      if (achievedMonth === currentMonth && achievedYear === currentYear) {
        achievedThisMonth = true;
        targetAchievedThisMonth++;
        currentMonthAchievedAmount += goal.targetAmount;
      }
    }
    if (goal.targetDate && !isAchieved) {
      const now = moment();
      const targetDate = moment(goal.targetDate);
      const monthsRemaining = targetDate.diff(now, 'months') + 1;

      if (monthsRemaining > 0) {
        monthlyTarget = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
        totalMonthlyTarget += monthlyTarget;
      }
    }

    if (!isAchieved) totalActiveGoals++;

    return {
      ...goal.toObject(),
      progress: Math.min(100, progress),
      targetAchieved: isAchieved,
      monthlyTarget,
      achievedThisMonth
    };
  });

  return {
    enhancedGoals,
    summary: {
      targetAchievedThisMonth,
      totalMonthlyTarget: parseFloat(totalMonthlyTarget.toFixed(2)),
      totalActiveGoals,
      currentMonthTotalTarget: currentMonthTargetAmount,
      currentMonthAchievedTarget: currentMonthAchievedAmount
    }
  };
};

export const getGoalsMetrics = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    const { summary } = calculateMetrics(goals);
    
    res.send({
      success: true,
      metrics: summary
    });
  } catch (error) {
    console.error('Get goals metrics error:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to calculate goals metrics'
    });
  }
};
export const getGoals = async (req, res) => {
  try {
    const match = { userId: req.user._id };

    if (req.query.category) {
      match.category = req.query.category;
    }

    const goals = await Goal.find(match);

    // Enhanced response with additional calculations
    const enhancedGoals = goals.map(goal => {
      return {
        ...goal.toObject(),
        progress: calculateProgress(goal),
        targetAchieved: calculateTargetAchieved(goal),
        monthlyTarget: calculateMonthlyTarget(goal)
      };
    });

    res.send(enhancedGoals);
  } catch (error) {
    res.status(500).send();
  }
};

export const getGoal = async (req, res) => {
  const enhancedGoal = {
    ...req.resource.toObject(),
    progress: calculateProgress(req.resource),
    targetAchieved: calculateTargetAchieved(req.resource),
    monthlyTarget: calculateMonthlyTarget(req.resource)
  };
  res.send(enhancedGoal);
};

function calculateProgress(goal) {
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
}

function calculateTargetAchieved(goal) {
  return goal.currentAmount >= goal.targetAmount;
}

function calculateMonthlyTarget(goal) {
  if (!goal.targetDate) return null;

  const now = moment();
  const targetDate = moment(goal.targetDate);
  const monthsRemaining = targetDate.diff(now, 'months') + 1; 

  if (monthsRemaining <= 0) return goal.targetAmount - goal.currentAmount;

  const remainingAmount = goal.targetAmount - goal.currentAmount;
  return Math.max(0, remainingAmount / monthsRemaining);
}

export const updateGoal = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'targetAmount', 'currentAmount', 'targetDate', 'category'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => req.resource[update] = req.body[update]);
    await req.resource.save();

 
    const enhancedGoal = {
      ...req.resource.toObject(),
      progress: calculateProgress(req.resource),
      targetAchieved: calculateTargetAchieved(req.resource),
      monthlyTarget: calculateMonthlyTarget(req.resource)
    };

    res.send(enhancedGoal);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const addToGoal = async (req, res) => {
  try {
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).send({ error: 'Invalid amount' });
    }

    req.resource.currentAmount += req.body.amount;
    await req.resource.save();

   
    const enhancedGoal = {
      ...req.resource.toObject(),
      progress: calculateProgress(req.resource),
      targetAchieved: calculateTargetAchieved(req.resource),
      monthlyTarget: calculateMonthlyTarget(req.resource)
    };

    res.send(enhancedGoal);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const deleteGoal = async (req, res) => {
  try {
    await req.resource.remove();
    res.send(req.resource);
  } catch (error) {
    res.status(500).send();
  }
};



export const getGoalProgress = async (req, res) => {
  try {
    const progress = (req.resource.currentAmount / req.resource.targetAmount) * 100;
    res.send({ progress: Math.min(100, progress) });
  } catch (error) {
    res.status(500).send();
  }
};