import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
require('events').EventEmitter.defaultMaxListeners = 50
let numberOfPosts = 50;

const genRandomAuthorId = () => {
  User.find(function(err, users) {
    const mapUsers = users.map((user => (user._id._id)));
    if (err) {
      console.log(err);
    }
    else {
      const saveFakePost = async () => {
        const postFactory = Post.fake(numberOfPosts);
        for (let [key, value] of Object.entries(postFactory)) {
          value.author = mapUsers[Math.floor(Math.random() * mapUsers.length)];
          const postSeed =
            await new Post(value)
            .save(function (err, data) {
              if (err) {
                console.log('The following error ocurred:')
                console.log(err)
              }
              mongoose.connection.close();
            })
        }
      }
      saveFakePost();
    }

    });
}

genRandomAuthorId();
