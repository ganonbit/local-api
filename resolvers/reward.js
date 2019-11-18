const Query = {
    /**
     * Gets rewards for specific user
     *
     * @param {string} userId
     * @param {int} skip how many rewards to skip
     * @param {int} limit how many rewards to limit
     */
    getUserRewards: async (
      root,
      { userId, skip, limit },
      { Reward }
    ) => {
      const query = { user: userId };
      const count = await Reward.where(query).countDocuments();
      const rewards = await Reward.where(query)
        .populate('user')
        .populate('points')
        .populate('events')
        .populate('achievements')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });
  
      return { rewards, count };
    },
  };
  
  const Mutation = {
    createRewards: async (
      root,
      {
        input: { userId, userPoints, userRewards, userAchievements },
      },
      { Reward, User }
    ) => {
      const newReward = await new Reward({
        user: userId,
        points: userPoints,
        events: userRewards,
        achievements: userAchievements
      }).save();
  
      // Push reward to user collection
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { rewards: newReward.id } }
      );
  
      return newReward;
    },
    /**
     * Deletes a reward
     *
     * @param {string} id
     */
    deleteReward: async (
      root,
      { input: { id } },
      { Reward, User }
    ) => {
      const reward = await Reward.findByIdAndRemove(id);
  
      // Delete reward from users collection
      await User.findOneAndUpdate(
        { _id: reward.user },
        { $pull: { rewards: reward.id } }
      );
  
      return reward;
    }
  };
  
  export default { Query, Mutation };
  