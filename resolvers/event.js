const Query = {

    getEvent: async (root, { id }, { Event }) => {
      const event = await Event.findById(id)
        .populate('name')
        .populate('action')
        .populate('awardedPoints');
      return event;
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
  