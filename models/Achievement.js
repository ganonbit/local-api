import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Achievement schema that has references to User, Like and Comment schemas
 */
const achievementSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {type: String, required: true, unique: true},
    action: {type: String},
    currentAmount: {type: Number, required: true, default: 0},
    neededAmount: {type: Number, required: true, default: 0},
  },
  {
    timestamps: true,
  }
); 

export default mongoose.model('Achievement', achievementSchema);
