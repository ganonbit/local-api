import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Message schema that has references to User, Like and Comment schemas
 */
const messageSchema = Schema(
  {
    content: String,
    image: String,
    imagePublicId: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', messageSchema);
