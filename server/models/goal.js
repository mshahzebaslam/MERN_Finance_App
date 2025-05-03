import mongoose from "mongoose";
const GoalSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    targetAmount: {
      type: Number,
      required: true
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    targetDate: Date,
    category: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  // export default mongoose.model("Goal", GoalSchema);

  export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
