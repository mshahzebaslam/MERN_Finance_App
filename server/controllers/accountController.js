import Account from '../models/account.js';

export const createAccount = async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      userId: req.user._id
    });
    await account.save();
    res.status(201).send(account);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    res.send(accounts);
  } catch (error) {
    res.status(500).send();
  }
};

export const getAccount = async (req, res) => {
  res.send(req.resource);
};

export const updateAccount = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'type', 'balance', 'lastFourDigits'];
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

export const deleteAccount = async (req, res) => {
  try {
    await req.resource.remove();
    res.send(req.resource);
  } catch (error) {
    res.status(500).send();
  }
};