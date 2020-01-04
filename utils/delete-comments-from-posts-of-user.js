import User from '../models/User';
import Comment from '../models/Comment';

const deleteCommentsFromPostsOfUser = async (user) => {
  try {
    user.posts.forEach(async postId => {
      let comments = await Comment.find({post: postId});
      if (!comments || !comments.length > 0) { return; }
      let authorArray = comments.map(function(comment) { return comment.author; });
      // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      let seen = {};
      const uniqueAuthorIds = authorArray.filter(function(item) {
          return seen.hasOwnProperty(item) ? false : (seen[item] = true);
      });
  
      uniqueAuthorIds.forEach(async authorId => {
        let authorComments = comments.filter(comment => {
          return comment.author.toString() === authorId.toString()
        })
  
        if (authorComments && authorComments.length > 0) {
          const author = await User.findById(authorId);

          if (author) {
            authorComments.forEach(comment => {
              author.comments.pull(comment.id)
            });
            await author.save();
          }
        }
      })
    })


  } catch(error) {
    console.log(`Error ocurred trying to delete comments from posts of user id: ${user.id}`)
    console.log(error)
    throw new Error(error);
  }
};

export default deleteCommentsFromPostsOfUser;
