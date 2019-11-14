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
    name: {type: String, required: true},
    current_amount: {type: Number, required: true},
    total_amount: {type: Number, required: true},
    scope: {type: Map, required: false, default: null}
  },
  {
    timestamps: true,
  }
); 
achievementSchema.index({ user: 1, name: 1 }, {unique: true});

export default mongoose.model('Achievement', achievementSchema);
