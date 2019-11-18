import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Reward schema that has references to User, Like and Comment schemas
 */
const rewardSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    points: [ 
      {
      type: Schema.Types.ObjectId,
      ref: 'User',
      }
    ],
    events: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    achievements: [
      {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      }
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Reward', rewardSchema);
