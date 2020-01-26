const Mutation = {
  /**
   * Creates a shared post
   *
   * @param {string} userId
   * @param {string} postId
   */
  createSharedPost: async (
    root,
    { input: { userId, postId } },
    { SharedPost, Post, User, Event }
  ) => {
    const sharedPost = await new SharedPost({ user: userId, post: postId }).save();
    const user = await User.findById(sharedPost.user);
    const event = await Event.findOne({ name: 'postShare'});
    const newPoints = user.sharePoints + event.awardedPoints;
    const totalPoints = user.totalPoints + event.awardedPoints;

    // Push shared post to post collection
    await Post.findOneAndUpdate({ _id: postId }, { $push: { shares: sharedPost.id } });
    // Push shared post and add points to user collection
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: { sharedPosts: sharedPost.id },
        $set: { sharePoints: newPoints, totalPoints: totalPoints },
      }
    );

    // await earnBadge();

    return sharedPost;
  },
  /**
   * Deletes a shared post
   *
   * @param {string} id
   */
  deleteSharedPost: async (
    root,
    { input: { id } },
    { SharedPost, User, Post, Event }
  ) => {
    const sharedPost = await SharedPost.findByIdAndRemove(id);
    const user = await User.findById(sharedPost.user);
    const event = await Event.findOne({ name: 'postShare'});
    const newPoints = user.sharePoints - event.awardedPoints;
    const totalPoints = user.totalPoints - event.awardedPoints;

    // Delete sharedPost from users collection
    await User.findOneAndUpdate(
      { _id: sharedPost.user },
      {
        $pull: { sharedPosts: sharedPost.id },
        $set: { sharePoints: newPoints, totalPoints: totalPoints },
      }
    );
    // Delete sharedPost from posts collection
    await Post.findOneAndUpdate(
      { _id: sharedPost.post },
      { $pull: { shares: sharedPost.id } }
    );

    return sharedPost;
  },
};

export default { Mutation };
