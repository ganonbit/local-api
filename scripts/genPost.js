import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const genRandomAuthorId = () => {
  User.find(function(err, users) {
    const mapUsers = users.map((user => (user._id._id)));
    // console.log("map of all userIds from mongodb collection: " + mapUsers) 
    const randomAuthor = mapUsers[Math.floor(Math.random() * mapUsers.length)];
    if (err) {
      console.log(err);
    }
    else {
      const saveFakePost = async () => {
        const postFactory = Post.fake();
        postFactory.author = randomAuthor;
        // console.log("generate fake post data: \n" + postFactory)
        const postSeed =
          await new Post(postFactory,)
          .save(function (error, data) {
            if (err) {
              console.log('The following error ocurred:')
              console.log(error)
            }
            console.log("create new post with fake data: \n" + data)
            
          })
      }
      saveFakePost();
    }

    });
}

genRandomAuthorId();
let callCount = 1;
const repeater = setInterval(function () {
  if (callCount < 5) {
    genRandomAuthorId();
    callCount += 1;
  } else {
    clearInterval(repeater);
    mongoose.connection.close()
  }
}, 2000);