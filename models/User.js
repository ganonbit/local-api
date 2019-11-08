import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
mongoose.plugin(require('@lykmapipo/mongoose-faker'));

let genderTypes = ['Male', 'Female', 'Custom'];

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
      }
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
      }
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
      }
    },
    birthday: {
      type: Date, default: Date.now,
      required: true,
      fake: {
        generator: 'date',
        type: 'past'
      }
    },
    gender: {
      type: String,
      enum: genderTypes,
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
    isBlocked: { type: Boolean, default: false },
    isExpert: { type: Boolean, default: false },
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
    points: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Point',
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
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

export default mongoose.model('User', userSchema);
