import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';

let arrayOfAuthors;

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


User.find().populate("_id").exec(function(err, users) {
  if(err)
    console.log(err)
  if(users){
    users.map((user) => {
      // console.log(user._id._id) 
      let arrayOfAuthors = user._id._id;
      console.log(arrayOfAuthors);
    });
    let randomAuthor = arrayOfAuthors[Math.floor(Math.random()*arrayOfAuthors.length)];
  }
});


// const saveFakePost = async () => {
//     const postFactory = Post.fake();
//     // console.log("generate fake post data: \n" + postFactory)
//     const postSeed =
//       await new Post(postFactory)
//       .save(function (err, data) {
//         if (err) {
//           console.log('The following error ocurred:')
//           console.log(err)
//         }
//         console.log("create new post with fake data: \n" + data)
//         // mongoose.connection.close();
//       })
//   }