import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Point schema that has references to User, Like and Comment schemas
 */
const pointSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Point', pointSchema);
