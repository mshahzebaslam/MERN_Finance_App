import mongoose from "mongoose";
const AccountSchema = mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'investment'],
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    lastFourDigits: String, // For credit cards
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

const Account = mongoose.model("Account", AccountSchema);
export default Account;