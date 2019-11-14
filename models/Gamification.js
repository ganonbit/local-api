import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Gamification schema that has references to User, Like and Comment schemas
 */
const gamificationSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    XPs: {
      type: Schema.Types.ObjectId,
      ref: 'XP',
    },
    events: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
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

export default mongoose.model('Gamification', gamificationSchema);
