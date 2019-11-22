const Query = {

    getUserPoints: async (
      root,
      { userId, skip, limit },
      { Point }
    ) => {
      const query = { user: userId };
      const count = await Point.where(query).countDocuments();
      const points = await Point.where(query)
        .populate('user')
        .populate('name')
        .populate('currentPoints')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });
  
      return { points, count };
    },

    searchPoints: async (root, { searchQuery }, { Point, authUser }) => {
      // Return an empty array if searchQuery isn't presented
      if (!searchQuery) {
        return [];
      }

      const points = Point.find({
        $or: [
          { user: new RegExp(searchQuery, 'i') },
          { name: new RegExp(searchQuery, 'i') },
        ],
        _id: {
          $ne: authUser.id,
        },
      }).limit(50);

      return points;
    },
  };
  
  const Mutation = {
    createPoint: async (
      root,
      {
        input: { allUsers, pointName, currentPoints },
      },
      { Point, User }
    ) => {
      let newPoint = await new Point({
        users: allUsers,
        name: pointName,
        currentPoints: currentPoints,
      }).save();
  
      // Push point to user collection
      await User.findOneAndUpdate(
        { _id: allUsers },
        { $push: { badges: newPoint.id } }
      );
  
      return newPoint;
    },
    /**
     * Deletes a point
     *
     * @param {string} id
     */
    deletePoint: async (
      root,
      { input: { id } },
      { Point, User }
    ) => {
      const point = await Point.findByIdAndRemove(id);
  
      // Delete point from users collection
      await User.findOneAndUpdate(
        { _id: point.user },
        { $pull: { badges: point.id } }
      );
  
      return point;
    }
  };
  
  export default { Query, Mutation };
  