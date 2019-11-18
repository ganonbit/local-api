import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * POINT schema that has references to User, Like and Comment schemas
 */
const pointSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    currentAmount: {type: Number, required: true, default: 0},
    usedAmount: {type: Number, required: true, default: 0},
    totalAmount: {type: Number, required: true, default: 0},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Point', pointSchema);
