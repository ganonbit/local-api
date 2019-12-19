import {} from 'dotenv/config';
import User from '../models/User';
import Post from '../models/Post';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const syncPostsInAlgolia = async () => {
  try {
    await Post.syncWithAlgolia();
    console.log('finished successfully!');
  } catch (error) {
    console.log('The following Error ocurred:');
    console.error(error);
  }
  mongoose.connection.close();
};

syncPostsInAlgolia();
