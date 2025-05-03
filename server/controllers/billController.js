import Bill from '../models/Bill.js';
export const createBill = async (req, res) => {
  try {
    const bill = new Bill({
      ...req.body,
      userId: req.user._id
    });
    await bill.save();
    res.status(201).send(bill);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getBills = async (req, res) => {
  try {
    const match = { userId: req.user._id };
    
    if (req.query.isPaid) {
      match.isPaid = req.query.isPaid === 'true';
    }
    
    if (req.query.frequency) {
      match.frequency = req.query.frequency;
    }
    
    const bills = await Bill.find(match);
    res.send(bills);
  } catch (error) {
    res.status(500).send();
  }
};

export const getBill = async (req, res) => {
  res.send(req.resource);
};

export const updateBill = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'amount', 'dueDate', 'frequency', 'isPaid', 'lastPaidDate'];
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

export const deleteBill = async (req, res) => {
  try {
    const bill = req.resource;
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully',
      deletedBill: {
        id: bill._id,
        name: bill.name,
        amount: bill.amount
      }
    });

  } catch (error) {
    console.error('Delete bill error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const markBillAsPaid = async (req, res) => {
  try {
    req.resource.isPaid = true;
    req.resource.lastPaidDate = new Date();
    await req.resource.save();
    res.send(req.resource);
  } catch (error) {
    res.status(400).send(error);
  }
};