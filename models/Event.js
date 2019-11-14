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
    payload: {type: Map, required: false, default: {}}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Event', eventSchema);
