import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Point schema that has references to User, Like and Comment schemas
 */
const pointSchema = Schema(
  {
    users: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    general: {type: Number, default: 0},
    like: {type: Number, default: 0},
    comment: {type: Number, default: 0},
    post: {type: Number, default: 0},
    share: {type: Number, default: 0},
    referral: {type: Number, default: 0},
    submission: {type: Number, default: 0},
    other: {type: Number, default: 0},
  },
  {
    timestamps: true,
  }
); 

export default mongoose.model('Point', pointSchema);