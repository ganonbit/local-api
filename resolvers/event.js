const Query = {

    getUserEvents: async (
      root,
      { userId, skip, limit },
      { Event }
    ) => {
      const query = { user: userId };
      const count = await Event.where(query).countDocuments();
      const events = await Event.where(query)
        .populate('user')
        .populate('name')
        .populate('action')
        .populate('awardedAmount')
        .populate({ path: 'points', populate: { path: 'currentPoints' } })
        .populate({ path: 'points', populate: { path: 'usedPoints' } })
        .populate({ path: 'points', populate: { path: 'totalPoints' } })
        .populate('achievements')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });
  
      return { events, count };
    },

    searchEvents: async (root, { searchQuery }, { Event, authUser }) => {
      // Return an empty array if searchQuery isn't presented
      if (!searchQuery) {
        return [];
      }

      const events = Event.find({
        $or: [
          { name: new RegExp(searchQuery, 'i') },
          { action: new RegExp(searchQuery, 'i') },
        ],
        _id: {
          $ne: authUser.id,
        },
      }).limit(50);

      return events;
    },
  };
  
  const Mutation = {
    createEvent: async (
      root,
      {
        input: { userId, eventName, eventAction, awardedPoints, currentPoints, usedPoints, totalPoints, userAchievements },
      },
      { Event, User }
    ) => {
      const newEvent = await new Event({
        user: userId,
        name: eventName,
        action: eventAction,
        awardedAmount: awardedPoints,
        currentPoints: currentPoints,
        usedPoints: usedPoints,
        totalPoints: totalPoints,
        achievements: userAchievements
      }).save();
  
      // Push event to user collection
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { events: newEvent.id } }
      );
  
      return newEvent;
    },
    /**
     * Deletes a event
     *
     * @param {string} id
     */
    deleteEvent: async (
      root,
      { input: { id } },
      { Event, User }
    ) => {
      const event = await Event.findByIdAndRemove(id);
  
      // Delete event from users collection
      await User.findOneAndUpdate(
        { _id: event.user },
        { $pull: { events: event.id } }
      );
  
      return event;
    }
  };
  
  export default { Query, Mutation };
  