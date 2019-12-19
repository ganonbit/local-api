import {} from 'dotenv/config';
import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';

require('events').EventEmitter.defaultMaxListeners = 50;

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

let numberOfPosts = 100;

const saveFakePosts = async mapUsers => {
  const postFactories = Post.fake(numberOfPosts);

  postFactories.map(async postFactory => {
    postFactory.author = mapUsers[Math.floor(Math.random() * mapUsers.length)];
    await new Post(postFactory).save(function(err) {
      if (err) {
        console.log(`The following error ocurred:\n${err}`);
      }
    });
  });
};

User.find(async function(err, users) {
  if (err) {
    console.log(err);
    mongoose.connection.close();
    return;
  }

  const mapUsers = users.map(user => user._id._id);
  await saveFakePosts(mapUsers);
  mongoose.connection.close();
});
