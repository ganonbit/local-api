import userResolver from "./user";
import postResolver from "./post";
import likeResolver from "./like";
import followResolver from "./follow";
import commentResolver from "./comment";
import notificationResolver from "./notification";
import message from "./message";
import eventResolver from "./event";
import achievementResolver from "./achievement";

export default [
  userResolver,
  postResolver,
  likeResolver,
  followResolver,
  commentResolver,
  notificationResolver,
  message,
  eventResolver,
  achievementResolver
];
