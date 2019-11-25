import {} from 'dotenv/config';
import mongoose from 'mongoose';
import mongoAlgolia from '../utils/mongo-algolia'
import bcrypt from 'bcryptjs';
mongoose.plugin(require('@lykmapipo/mongoose-faker'));

let genderTypes = ['Male', 'Female', 'Custom'];
let roleTypes = ['selma', 'expert', 'user'];

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like, Comment, Follow and Notification schemas
 */
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      fake: {
        generator: 'name',
        type: 'findName'
      },
      algoliaIndex: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      fake: {
        generator: 'internet',
        type: 'email'
      },
      algoliaIndex: true
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      fake: {
        generator: 'internet',
        type: 'userName'
      },
      algoliaIndex: true
    },
    birthday: {
      type: Date, default: Date.now,
      required: false,
      fake: {
        generator: 'date',
        type: 'past'
      },
      algoliaIndex: true
    },
    gender: {
      type: String,
      // required: true,
      enum: genderTypes,
      algoliaIndex: true
    },
    bio: {
      type: String,
      trim: true,
      fake: {
        generator: 'lorem',
        type: 'sentence'
      }
    },
    location: {
      type: String,
      lowercase: true,
      trim: true,
    },
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    password: {
      type: String,
      required: true,
      fake: {
        generator: 'internet',
        type: 'password'
      }
    },
    image: String,
    imagePublicId: String,
    coverImage: String,
    coverImagePublicId: String,
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isGuru: { type: Boolean, default: false },
    isPick: { type: Boolean, default: false },
    role: {
      type: String,
      enum: roleTypes,
      default: 'user',
      algoliaIndex: true
    },
    level: { type: Number, default: 1 },
    accountPoints: {type: Number, default: 0},
    likePoints: {type: Number, default: 0},
    commentPoints: {type: Number, default: 0},
    sharePoints: {type: Number, default: 0},
    referralPoints: {type: Number, default: 0},
    gamePoints: {type: Number, default: 0},
    currentPoints: {type: Number, default: 0},
    usedPoints: {type: Number, default: 0},
    totalPoints: {type: Number, default: 0},
    pagesViewed: {type: Number, default: 0},
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
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
      }
    ]
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

userSchema.plugin(mongoAlgolia, {
  appId: process.env.ALGOLIA_APP_ID,
  apiKey: process.env.ALGOLIA_API_KEY,
  indexName: process.env.ALGOLIA_USERS_INDEX
})

export default mongoose.model('User', userSchema);
