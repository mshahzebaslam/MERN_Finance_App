import mongoose from "mongoose";
const BillSchema =mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    lastPaidDate: Date
  });

  export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
