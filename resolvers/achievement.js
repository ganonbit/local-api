const Query = {
    /**
     * Gets achievements for specific user
     *
     * @param {string} userId
     * @param {int} skip how many achievements to skip
     * @param {int} limit how many achievements to limit
     */
    getUserAchievements: async (
      root,
      { userId, skip, limit },
      { Achievement }
    ) => {
      const query = { user: userId };
      const count = await Achievement.where(query).countDocuments();
      const achievements = await Achievement.where(query)
        .populate('user')
        .populate('name')
        .populate('currentAmount')
        .populate('neededAmount')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });
  
      return { achievements, count };
    },
  };
  
  const Mutation = {
    createAchievements: async (
      root,
      {
        input: { userId, achievementName, currentAmount, neededAmount },
      },
      { Achievement, User }
    ) => {
      const newAchievement = await new Achievement({
        user: userId,
        name: achievementName,
        currentAmount: currentAmount,
        neededAmount: neededAmount,
      }).save();
  
      // Push achievement to user collection
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { achievements: newAchievement.id } }
      );
  
      return newAchievement;
    },
    /**
     * Deletes a achievement
     *
     * @param {string} id
     */
    deleteAchievement: async (
      root,
      { input: { id } },
      { Achievement, User }
    ) => {
      const achievement = await Achievement.findByIdAndRemove(id);
  
      // Delete achievement from users collection
      await User.findOneAndUpdate(
        { _id: achievement.user },
        { $pull: { achievements: achievement.id } }
      );
  
      return achievement;
    }
  };
  
  export default { Query, Mutation };
  