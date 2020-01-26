import userResolver from './user';
import postResolver from './post';
import likeResolver from './like';
import feedbackFormResolver from './feedback-form';
import followResolver from './follow';
import commentResolver from './comment';
import notificationResolver from './notification';
import message from './message';
import eventResolver from './event';
import achievementResolver from './achievement';
import sharedPostResolver from './shared-post';

export default [
  userResolver,
  postResolver,
  likeResolver,
  feedbackFormResolver,
  followResolver,
  commentResolver,
  notificationResolver,
  message,
  eventResolver,
  achievementResolver,
  sharedPostResolver,
];
