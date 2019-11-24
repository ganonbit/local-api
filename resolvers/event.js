const Query = {

    getEvents: async (
      root,
      { userId, skip, limit },
      { Event }
    ) => {
      const query = { user: userId };
      const count = await Event.where(query).countDocuments();
      const events = await Event.where(query)
        .populate('name')
        .populate('action')
        .populate('awardedPoints')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' });
  
      return { events, count };
    },

    searchEvents: async (root, { searchQuery }, { Event }) => {
      // Return an empty array if searchQuery isn't presented
      if (!searchQuery) {
        return [];
      }

      const events = Event.find({
        $or: [
          { name: new RegExp(searchQuery, 'i') },
          { action: new RegExp(searchQuery, 'i') },
        ]
      }).limit(50);

      return events;
    },
  };
  
  const Mutation = {
    createEvent: async (
      root,
      {
        input: { eventName, eventAction, awardedPoints },
      },
      { Event }
    ) => {
      const newEvent = await new Event({
        name: eventName,
        action: eventAction,
        awardedPoints: awardedPoints
      }).save();
  
      // Push event to user collection
      // await User.findOneAndUpdate(
      //   { _id: userId },
      //   { $push: { events: newEvent.id } }
      // );
  
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
      { Event }
    ) => {
      const event = await Event.findByIdAndRemove(id);
  
      return event;
    }
  };
  
  export default { Query, Mutation };
  