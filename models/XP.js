import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * XP schema that has references to User, Like and Comment schemas
 */
const xpSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {type: String, required: true},
    amount: {type: Number, required: true}
  },
  {
    timestamps: true,
  }
);
xpSchema.index({ user: 1, name: 1 }, {unique: true});

export default mongoose.model('XP', xpSchema);
