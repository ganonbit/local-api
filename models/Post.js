import {} from 'dotenv/config';
import mongoose from 'mongoose';
import mongoAlgolia from '../utils/mongo-algolia';
mongoose.plugin(require('@lykmapipo/mongoose-faker'));

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const postSchema = Schema(
  {
    content: {
      type: String,
      fake: {
        generator: 'lorem',
        type: 'paragraph',
      },
      algoliaIndex: true,
    },
    image: {
      type: String,
      // fake: {
      //   generator: 'image',
      //   type: 'avatar'
      // }
    },
    imagePublicId: String,
    isFeatured: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      algoliaIndex: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shares: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SharedPost',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const {ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_POSTS_INDEX } = process.env;

postSchema.plugin(mongoAlgolia, {
  appId: ALGOLIA_APP_ID,
  apiKey: ALGOLIA_API_KEY,
  indexName: ALGOLIA_POSTS_INDEX,
});

export default mongoose.model('Post', postSchema);
