import Post from '../models/Post';
import User from '../models/User';
import mongoose from 'mongoose';

const saveFakePost = async () => {
    const postFactory = Post.fake();
    console.log("generate fake post data: \n" + postFactory)
    let authorId;
    const postSeed =
      await new Post(postFactory)
      .save(function (err, data) {
        if (err) {
          console.log('The following error ocurred:')
          console.log(err)
        }
        console.log("create new post with fake data: \n" + data)
        mongoose.connection.close();
      })
  }
  
  saveFakePost()
