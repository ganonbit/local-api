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
    },
    name: {type: String, required: true, unique: true},
    action: {type: String},
    points: {
      type: Schema.Types.ObjectId,
      ref: 'Points',
    },
  },
  {
    timestamps: true,
  }
); 

export default mongoose.model('Achievement', achievementSchema);
