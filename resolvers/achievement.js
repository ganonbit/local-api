const Query = {

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

    searchAchievements: async (root, { searchQuery }, { Achievement, authUser }) => {
      // Return an empty array if searchQuery isn't presented
      if (!searchQuery) {
        return [];
      }

      const achievements = Achievement.find({
        $or: [
          { user: new RegExp(searchQuery, 'i') },
          { name: new RegExp(searchQuery, 'i') },
        ],
        _id: {
          $ne: authUser.id,
        },
      }).limit(50);

      return achievements;
    },
  };
  
  const Mutation = {
    createAchievement: async (
      root,
      {
        input: { userId, achievementName, currentPoints, neededPoints },
      },
      { Achievement, User }
    ) => {
      const newAchievement = await new Achievement({
        user: userId,
        name: achievementName,
        currentAmount: currentPoints,
        neededAmount: neededPoints,
      }).save();
  
      // Push achievement to user collection
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { badges: newAchievement.id } }
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
        { $pull: { badges: achievement.id } }
      );
  
      return achievement;
    }
  };
  
  export default { Query, Mutation };
  