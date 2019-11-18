import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Event schema that has references to User, Like and Comment schemas
 */
const eventSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {type: String, required: true},
    action: {type: String, required: true},
    awardedAmount: {type: Number, required: true, default: 0},
    points: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    achievements: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
    },      
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Event', eventSchema);
