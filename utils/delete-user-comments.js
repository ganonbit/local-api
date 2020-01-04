import Comment from '../models/Comment';
import Post from '../models/Post';

const deleteUserComments = async (user) => {
  try {
    user.comments && user.comments.forEach(async commentId => {
      const comment = await Comment.findById(commentId)
      if (comment) {
        const post = await Post.findById(comment.post);

        if (post) {    
          post.comments.pull(commentId);
          await post.save();
        }
      }
    })

    await Comment.deleteMany({ author: user.id });

  } catch(error) {
    console.log(`Error ocurred trying to delete comments of user id: ${user.id}`)
    console.log(error)
    throw new Error(error);
  }
};

export default deleteUserComments;
