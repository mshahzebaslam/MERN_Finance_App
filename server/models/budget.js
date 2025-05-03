import mongoose from "mongoose";
const BudgetSchema =  mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['housing', 'entertainment', 'food', 'shopping', 'transportation', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  export default mongoose.model("Budget", BudgetSchema);