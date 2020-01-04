import Like from '../models/Like';
import Post from '../models/Post';

const deleteUserLikes = async (user) => {
  try {
    user.likes && user.likes.forEach(async likeId => {
      const like = await Like.findById(likeId)
      if (like) {
        const post = await Post.findById(like.post);

        if (post) {
          post.likes.pull(likeId);
          await post.save();
        }
      }
    })

    await Like.deleteMany({ user: user.id });

  } catch(error) {
    console.log(`Error ocurred trying to delete likes of user id: ${user.id}`)
    console.log(error)
    throw new Error(error);
  }
};

export default deleteUserLikes;
