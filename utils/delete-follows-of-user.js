import User from '../models/User';
import Follow from '../models/Follow';

const deleteFollowsOfUser = async (userId) => {
  try {
    const follows = await Follow.find({$or: [
      {user: userId},
      {follower: userId}
    ]});

    if (follows && follows.length > 0) {
      follows.forEach(async follow => {
        let ownerOfFollow = await User.findOne({ following: follow.id });
        if (ownerOfFollow) {
          ownerOfFollow.following.pull(follow.id)
          ownerOfFollow.followers.pull(follow.id)
          await ownerOfFollow.save()
        }
      })
    }

    await Follow.deleteMany({ follower: userId });
    await Follow.deleteMany({ user: userId});
  } catch(error) {
    console.log(`Error ocurred trying to delete follows of user id: ${userId}`)
    console.log(error)
    throw new Error(error);
  }
};

export default deleteFollowsOfUser;
