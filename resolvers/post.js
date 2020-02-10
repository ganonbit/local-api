import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

const Query = {
  /**
   * Gets all posts
   *
   * @param {string} authUserId
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getPosts: async (root, { authUserId, skip, limit }, { Post }) => {
    const query = {
      $and: [{ image: { $ne: null } }, { author: { $ne: authUserId } }],
    };
    const postsCount = await Post.find(query).countDocuments();
    const allPosts = await Post.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 'desc' } },
        populate: { path: 'author' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { posts: allPosts, count: postsCount };
  },
  /**
   * Gets posts from followed users
   *
   * @param {string} userId
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getFollowedPosts: async (root, { userId, skip, limit }, { Post, Follow, SharedPost }) => {
    // Find user ids, that current user follows
    const userFollowing = [];
    const follow = await Follow.find({ follower: userId }, { _id: 0 }).select(
      'user'
    );
    follow.map(f => userFollowing.push(f.user));

    // Find user posts and followed posts by using userFollowing ids array
    const query = {
      $or: [{ author: { $in: userFollowing } }, { author: userId }],
    };

    const queryForShared = {
      $or: [{ user: { $in: userFollowing } }, { user: userId }],
    };

    const followedPosts = await Post.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 'desc' } },
        populate: { path: 'author' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    const followedSharedPosts = await SharedPost.find(queryForShared)
      .populate(
        [
          {
            path: 'user',
            select: 'id firstName lastName username'
          },
          {
            path: 'post',
            populate: [
              { path: 'author', select: 'id firstName lastName username' },
              { path: 'likes' },
              {
                path: 'comments',
                options: { sort: { createdAt: 'desc' } },
                populate: { path: 'author' },
              },
            ],
          }
        ]
      )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    const combinedPosts = followedPosts.concat(followedSharedPosts);

    return { posts: combinedPosts, count: combinedPosts.length };
  },
  /**
   * Gets post by id
   *
   * @param {string} id
   */
  getPost: async (root, { id }, { Post }) => {
    const post = await Post.findById(id)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'author' },
      });
    return post;
  },
};

const Mutation = {
  /**
   * Creates a new post
   *
   * @param {string} content
   * @param {string} image
   * @param {string} authorId
   */
  createPost: async (
    root,
    { input: { content, image, authorId } },
    { Post, User, Event }
  ) => {
    if (!content && !image) {
      throw new Error('Post content or image is required.');
    }

    let imageUrl, imagePublicId;
    if (image) {
      const { createReadStream } = await image;
      const stream = createReadStream();
      const uploadImage = await uploadToCloudinary(stream, 'post');
      console.log(uploadImage)
      if (!uploadImage.secure_url) {
        throw new Error(
          'Something went wrong while uploading image to Cloudinary'
        );
      }

      let optimizedImage = uploadImage.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'); 
      imageUrl = await optimizedImage;
      imagePublicId = uploadImage.public_id;
    }

    const newPost = await new Post({
      content,
      image: imageUrl,
      imagePublicId,
      author: authorId,
    }).save();

    const event = await Event.findOne({ name: 'createdPost'});
    const user = await User.findById(newPost.author);
    const newPoints = user.accountPoints + event.awardedPoints;
    const totalPoints = user.totalPoints + event.awardedPoints;

    await User.findOneAndUpdate(
      { _id: authorId },
      {
        $push: { posts: newPost.id },
        $set: { accountPoints: newPoints, totalPoints: totalPoints },
      }
    );

    return newPost;
  },

  editPost: async (
    root,
    { id, input: { content, image, authorId, imagePublicId } },
    { Post, User }
  ) => {
    let imageUrl;
    const now = Date.now();
    let currentImage = !imagePublicId ? null : imagePublicId;

    if (!content && !image) {
      throw new Error('Post content or image is required.');
    }
    if (image) {
      if (currentImage !== null) {
        const deleteImage = await deleteFromCloudinary(imagePublicId);

        if (deleteImage.result !== 'ok') {
          throw new Error(
            'Something went wrong while deleting image from Cloudinary'
          );
        }
        let currentImage;
      }
      const { createReadStream } = await image;
      const stream = createReadStream();
      const uploadImage = await uploadToCloudinary(stream, 'post');

      if (!uploadImage.secure_url) {
        throw new Error(
          'Something went wrong while uploading image to Cloudinary'
        );
      }

      let optimizedImage = uploadImage.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'); 
      imageUrl = await optimizedImage;
      imagePublicId = uploadImage.public_id;
    }

    let editedPost = await Post.findOneAndUpdate(
      { _id: id },
      {
        content,
        image: imageUrl,
        imagePublicId: imagePublicId,
        updatedAt: now,
      },
      { new: true }
    );

    await User.findOneAndUpdate({ _id: authorId }, { $push: { posts: id } });

    return editedPost;
  },
  deleteImage: async (root, { input: { imagePublicId } }) => {
    // Remove image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting image from Cloudinary'
        );
      }
    }
  },
  /**
   * Deletes a user post
   *
   * @param {string} id
   * @param {imagePublicId} id
   */
  deletePost: async (
    root,
    { input: { id, imagePublicId } },
    { Post, Like, User, Event, Comment, Notification }
  ) => {
    // Remove post image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting image from Cloudinary'
        );
      }
    }

    // Find post and remove it
    const post = await Post.findByIdAndRemove(id);

    const user = await User.findById(post.author);
    const event = await Event.findOne({ name: 'createdPost'});
    const newPoints = user.accountPoints - event.awardedPoints;
    const totalPoints = user.totalPoints - event.awardedPoints;

    await User.findOneAndUpdate(
      { _id: post.author },
      {
        $pull: { posts: post.id },
        $set: { accountPoints: newPoints, totalPoints: totalPoints },
      }
    );

    // Delete post likes from likes collection
    await Like.find({ post: post.id }).deleteMany();
    // Delete post likes from users collection
    post.likes.map(async likeId => {
      await User.where({ likes: likeId }).updateOne({
        $pull: { likes: likeId },
      });
    });

    // Delete post comments from comments collection
    await Comment.find({ post: post.id }).deleteMany();
    // Delete comments from users collection
    post.comments.map(async commentId => {
      await User.where({ comments: commentId }).updateOne({
        $pull: { comments: commentId },
      });
    });

    // Find user notification in users collection and remove them
    const userNotifications = await Notification.find({ post: post.id });

    userNotifications.map(async notification => {
      await User.where({ notifications: notification.id }).updateOne({
        $pull: { notifications: notification.id },
      });
    });
    // Remove notifications from notifications collection
    await Notification.find({ post: post.id }).deleteMany();

    return post;
  },
};

export default { Query, Mutation };
