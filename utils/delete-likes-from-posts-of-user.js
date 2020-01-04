import User from '../models/User';
import Like from '../models/Like';

const deleteLikesFromPostsOfUser = async (user) => {
  try {
    user.posts.forEach(async postId => {
      let likes = await Like.find({post: postId});
      if (!likes || !likes.length > 0) { return; }
      let userArray = likes.map(function(like) { return like.user; });
      // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
      let seen = {};
      const uniqueUserIds = userArray.filter(function(item) {
          return seen.hasOwnProperty(item) ? false : (seen[item] = true);
      });
  
      uniqueUserIds.forEach(async userId => {
        let userLikes = likes.filter(like => {
          return like.user.toString() === userId.toString()
        })

        if (userLikes && userLikes.length > 0) {
          let ownerOfLike = await User.findById(userId);

          if(ownerOfLike) {
            userLikes.forEach(like => {
              ownerOfLike.likes.pull(like.id)
            });
            await ownerOfLike.save();
          }
        }
      })
    })

  } catch(error) {
    console.log(`Error ocurred trying to delete likes from posts of user id: ${user.id}`)
    console.log(error)
    throw new Error(error);
  }
};

export default deleteLikesFromPostsOfUser;
