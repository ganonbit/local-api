import {} from 'dotenv/config';
import mongoose from 'mongoose';
import mongoAlgolia from '../utils/mongo-algolia';
import bcrypt from 'bcryptjs';
mongoose.plugin(require('@lykmapipo/mongoose-faker'));

let genderTypes = ['male', 'female', 'custom'];
let roleTypes = ['admin', 'expert', 'user'];

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      fake: {
        generator: 'name',
        type: 'firstName',
      },
      algoliaIndex: true,
    },
    lastName: {
      type: String,
      required: true,
      fake: {
        generator: 'name',
        type: 'lastName',
      },
      algoliaIndex: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      fake: {
        generator: 'internet',
        type: 'email',
      },
      algoliaIndex: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      fake: {
        generator: 'internet',
        type: 'userName',
      },
      algoliaIndex: true,
    },
    birthday: {
      type: Date,
      default: Date.now,
      required: false,
      fake: {
        generator: 'date',
        type: 'past',
      },
      algoliaIndex: true,
    },
    gender: {
      type: String,
      // required: true,
      enum: genderTypes,
      algoliaIndex: true,
    },
    bio: {
      type: String,
      trim: true,
      fake: {
        generator: 'lorem',
        type: 'sentence',
      },
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emailToken: String,
    emailTokenExpiry: Date,
    password: {
      type: String,
      required: true,
      fake: {
        generator: 'internet',
        type: 'password',
      },
    },
    image: {
      type: String,
      algoliaIndex: true
    },
    imagePublicId: {
      type: String,
      algoliaIndex: true
    },
    coverImage: String,
    coverImagePublicId: String,
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false, algoliaIndex: true },
    isBanned: { type: Boolean, default: false, algoliaIndex: true },
    isGuru: { type: Boolean, default: false, algoliaIndex: true },
    isPick: { type: Boolean, default: false, algoliaIndex: true },
    role: {
      type: String,
      enum: roleTypes,
      default: 'user',
      algoliaIndex: true,
    },
    level: { type: Number, default: 1 },
    accountPoints: { type: Number, default: 0 },
    likePoints: { type: Number, default: 0 },
    commentPoints: { type: Number, default: 0 },
    sharePoints: { type: Number, default: 0 },
    referralPoints: { type: Number, default: 0 },
    referrerId: String,
    referredUserIds: [String],
    gamePoints: { type: Number, default: 0 },
    currentPoints: { type: Number, default: 0 },
    usedPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    pagesViewed: { type: Number, default: 0 },
    socialHandles: {
      type: Map,
      of: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    sharedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SharedPost',
      },
    ],
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
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Hashes the users password when saving it to DB
 */
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

const {ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_POSTS_INDEX } = process.env;

userSchema.plugin(mongoAlgolia, {
  appId: ALGOLIA_APP_ID,
  apiKey: ALGOLIA_API_KEY,
  indexName: ALGOLIA_POSTS_INDEX,
});

export default mongoose.model('User', userSchema);
