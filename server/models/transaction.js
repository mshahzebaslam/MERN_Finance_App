import mongoose from "mongoose";
const TransactionSchema = mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['housing', 'entertainment', 'food', 'shopping', 'transportation', 'other'],
      required: true
    },
    merchant: String,
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    }
  });

  export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);