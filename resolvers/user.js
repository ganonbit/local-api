import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { withFilter } from 'apollo-server';

import { uploadToCloudinary } from '../utils/cloudinary';
import { generateToken } from '../utils/generate-token';
import { sendEmail } from '../utils/email';
import { pubSub } from '../utils/apollo-server';

import { IS_USER_ONLINE } from '../constants/Subscriptions';

const AUTH_TOKEN_EXPIRY = '1y';
const EMAIL_TOKEN_EXPIRY = 43200;

const Query = {
  /**
   * Gets the currently logged in user
   */
  getAuthUser: async (root, args, { authUser, Message, User }) => {
    if (!authUser) return null;

    // If user is authenticated, update it's isOnline field to true
    const user = await User.findOneAndUpdate(
      { email: authUser.email },
      { isOnline: true }
    )
      .populate({ path: 'posts', options: { sort: { createdAt: 'desc' } } })
      .populate('likes')
      .populate('followers')
      .populate('following')
      .populate({
        path: 'notifications',
        populate: [
          { path: 'author' },
          { path: 'follow' },
          { path: 'like', populate: { path: 'post' } },
          { path: 'comment', populate: { path: 'post' } },
        ],
        match: { seen: false },
      });

    user.newNotifications = user.notifications;

    // Find unseen messages
    const lastUnseenMessages = await Message.aggregate([
      {
        $match: {
          receiver: mongoose.Types.ObjectId(authUser.id),
          seen: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$sender',
          doc: {
            $first: '$$ROOT',
          },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
    ]);

    // Transform data
    const newConversations = [];
    lastUnseenMessages.map(u => {
      const user = {
        id: u.sender[0]._id,
        username: u.sender[0].username,
        fullName: u.sender[0].fullName,
        image: u.sender[0].image,
        lastMessage: u.message,
        lastMessageCreatedAt: u.createdAt,
      };

      newConversations.push(user);
    });

    // Sort users by last created messages date
    const sortedConversations = newConversations.sort((a, b) =>
      b.lastMessageCreatedAt.toString().localeCompare(a.lastMessageCreatedAt)
    );

    // Attach new conversations to auth User
    user.newConversations = sortedConversations;

    return user;
  },
  /**
   * Gets user by username
   *
   * @param {string} username
   */
  getUser: async (root, { username, id }, { User }) => {
    if (!username && !id) {
      throw new Error('username or id is required params.');
    }

    if (username && id) {
      throw new Error('please pass only username or only id as a param');
    }

    const query = username ? { username: username } : { _id: id };
    const user = await User.findOne(query)
      .populate({
        path: 'posts',
        populate: [
          {
            path: 'author',
            populate: [
              { path: 'followers' },
              { path: 'following' },
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
          },
          { path: 'comments', populate: { path: 'author' } },
          { path: 'likes' },
        ],
        options: { sort: { createdAt: 'desc' } },
      })
      .populate('likes')
      .populate('followers')
      .populate('following')
      .populate({
        path: 'notifications',
        populate: [
          { path: 'author' },
          { path: 'follow' },
          { path: 'like' },
          { path: 'comment' },
        ],
      });

    if (!user) {
      throw new Error("User with given params doesn't exists.");
    }

    return user;
  },
  /**
   * Gets user posts by username
   *
   * @param {string} username
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getUserPosts: async (root, { username, skip, limit }, { User, Post }) => {
    const user = await User.findOne({ username }).select('_id');

    const query = { author: user._id };
    const count = await Post.find(query).countDocuments();
    const posts = await Post.find(query)
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

    return { posts, count };
  },
  /**
   * Gets all users
   *
   * @param {string} userId
   * @param {int} skip how many users to skip
   * @param {int} limit how many users to limit
   */
  getUsers: async (root, { userId, skip, limit }, { User, Follow }) => {
    // Find user ids, that current user follows
    const userFollowing = [];
    const follow = await Follow.find({ follower: userId }, { _id: 0 }).select(
      'user'
    );
    follow.map(f => userFollowing.push(f.user));

    // Find users that user is not following
    const query = {
      $and: [{ _id: { $ne: userId } }, { _id: { $nin: userFollowing } }],
    };
    const count = await User.where(query).countDocuments();
    const users = await User.find(query)
      .populate('followers')
      .populate('following')
      .populate({
        path: 'notifications',
        populate: [
          { path: 'author' },
          { path: 'follow' },
          { path: 'like' },
          { path: 'comment' },
        ],
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { users, count };
  },
  /**
   * Searches users by username or fullName
   *
   * @param {string} searchQuery
   */
  searchUsers: async (root, { searchQuery }, { User, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const users = User.find({
      $or: [
        { username: new RegExp(searchQuery, 'i') },
        { fullName: new RegExp(searchQuery, 'i') },
      ],
      _id: {
        $ne: authUser.id,
      },
    }).limit(50);

    return users;
  },
  /**
   * Gets Suggested people for user
   *
   * @param {string} userId
   */
  suggestPeople: async (root, { userId }, { User, Follow }) => {
    const LIMIT = 6;

    // Find who user follows
    const userFollowing = [];
    const following = await Follow.find(
      { follower: userId },
      { _id: 0 }
    ).select('user');
    following.map(f => userFollowing.push(f.user));
    userFollowing.push(userId);

    // Find random users
    const query = { _id: { $nin: userFollowing } };
    const usersCount = await User.where(query).countDocuments();
    let random = Math.floor(Math.random() * usersCount);

    const usersLeft = usersCount - random;
    if (usersLeft < LIMIT) {
      random = random - (LIMIT - usersLeft);
      if (random < 0) {
        random = 0;
      }
    }

    const randomUsers = await User.find(query)
      .skip(random)
      .limit(LIMIT);

    return randomUsers;
  },
  /**
   * Verifies reset password token
   *
   * @param {string} email
   * @param {string} token
   */
  verifyToken: async (root, { email, token }, { User }) => {
    // Check if user exists and token is valid
    const user = await User.findOne({
      email,
      emailToken: token,
      emailTokenExpiry: {
        $gte: Date.now() - EMAIL_TOKEN_EXPIRY,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    return { message: 'Success' };
  },
};

const Mutation = {
  /**
   * Signs in user
   *
   * @param {string} emailOrUsername
   * @param {string} password
   */
  signin: async (root, { input: { emailOrUsername, password } }, { User }) => {
    const user = await User.findOne().or([
      { email: emailOrUsername },
      { username: emailOrUsername },
    ]);

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.isVerified === false) {
      throw new Error('Account not verified. Please check email to verify your account!');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password.');
    }

    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },
  /**
   * Signs up user
   *
   * @param {string} fullName
   * @param {string} email
   * @param {string} username
   * @param {string} password
   */
  signup: async (
    root,
    { input: { fullName, email, username, password } },
    { User, Event }
  ) => {
    // Check if user with given email or username already exists
    const user = await User.findOne().or([{ email }, { username }]);


    if (user) {
      const field = user.email === email ? 'email' : 'username';
      throw new Error(`User with given ${field} already exists.`);
    }

    // Empty field validation
    if (!fullName || !email || !username || !password) {
      throw new Error('All fields are required.');
    }

    // FullName validation
    if (fullName.length > 40) {
      throw new Error('Full name no more than 40 characters.');
    }
    if (fullName.length < 4) {
      throw new Error('Full name min 4 characters.');
    }

    // Email validation
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
      throw new Error('Enter a valid email address.');
    }

    // Username validation
    const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
    if (!usernameRegex.test(username)) {
      throw new Error(
        'Usernames can only use letters, numbers, underscores and periods.'
      );
    }
    if (username.length > 20) {
      throw new Error('Username no more than 50 characters.');
    }
    if (username.length < 3) {
      throw new Error('Username min 3 characters.');
    }
    const usernameBlacklist = [
      'selmaa','selmaavocados','selma-avocados','sselma','discover','people','inspiration','recipes','graphql','points','rewards','contests','contest','content','reward','point','send','sender','sent','edit-profile','share','verified','verification','.htaccess', '.htpasswd', '.well-known', '400', '401', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '421', '422', '423', '424', '426', '428', '429', '431', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', 'about', 'about-us', 'abuse', 'access', 'account', 'accounts', 'ad', 'add', 'admin', 'administration', 'administrator', 'ads', 'advertise', 'advertising', 'aes128-ctr', 'aes128-gcm', 'aes192-ctr', 'aes256-ctr', 'aes256-gcm', 'affiliate', 'affiliates', 'ajax', 'alert', 'alerts', 'alpha', 'amp', 'analytics', 'api', 'app', 'apps', 'asc', 'assets', 'atom', 'auth', 'authentication', 'authorize', 'autoconfig', 'autodiscover', 'avatar', 'backup', 'banner', 'banners', 'beta', 'billing', 'billings', 'blog', 'blogs', 'board', 'bookmark', 'bookmarks', 'broadcasthost', 'business', 'buy', 'cache', 'calendar', 'campaign', 'captcha', 'careers', 'cart', 'cas', 'categories', 'category', 'cdn', 'cgi', 'cgi-bin', 'chacha20-poly1305', 'change', 'channel', 'channels', 'chart', 'chat', 'checkout', 'clear', 'client', 'close', 'cms', 'com', 'comment', 'comments', 'community', 'compare', 'compose', 'config', 'connect', 'contact', 'contest', 'cookies', 'copy', 'copyright', 'count', 'create', 'crossdomain.xml', 'css', 'curve25519-sha256', 'customer', 'customers', 'customize', 'dashboard', 'db', 'deals', 'debug', 'delete', 'desc', 'destroy', 'dev', 'developer', 'developers', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'disconnect', 'discuss', 'dns', 'dns0', 'dns1', 'dns2', 'dns3', 'dns4', 'docs', 'documentation', 'domain', 'download', 'downloads', 'downvote', 'draft', 'drop', 'ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'edit', 'editor', 'email', 'enterprise', 'error', 'errors', 'event', 'events', 'example', 'exception', 'exit', 'explore', 'export', 'extensions', 'false', 'family', 'faq', 'faqs', 'favicon.ico', 'features', 'feed', 'feedback', 'feeds', 'file', 'files', 'filter', 'follow', 'follower', 'followers', 'following', 'fonts', 'forgot', 'forgot-password', 'forgotpassword', 'form', 'forms', 'forum', 'forums', 'friend', 'friends', 'ftp', 'get', 'git', 'go', 'group', 'groups', 'guest', 'guidelines', 'guides', 'head', 'header', 'help', 'hide', 'hmac-sha', 'hmac-sha1', 'hmac-sha1-etm', 'hmac-sha2-256', 'hmac-sha2-256-etm', 'hmac-sha2-512', 'hmac-sha2-512-etm', 'home', 'host', 'hosting', 'hostmaster', 'htpasswd', 'http', 'httpd', 'https', 'humans.txt', 'icons', 'images', 'imap', 'img', 'import', 'index', 'info', 'insert', 'investors', 'invitations', 'invite', 'invites', 'invoice', 'is', 'isatap', 'issues', 'it', 'jobs', 'join', 'js', 'json', 'keybase.txt', 'learn', 'legal', 'license', 'licensing', 'like', 'limit', 'live', 'load', 'local', 'localdomain', 'localhost', 'lock', 'login', 'logout', 'lost-password', 'mail', 'mail0', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mail6', 'mail7', 'mail8', 'mail9', 'mailer-daemon', 'mailerdaemon', 'map', 'marketing', 'marketplace', 'master', 'me', 'media', 'member', 'members', 'message', 'messages', 'metrics', 'mis', 'mobile', 'moderator', 'modify', 'more', 'mx', 'my', 'net', 'network', 'new', 'news', 'newsletter', 'newsletters', 'next', 'nil', 'no-reply', 'nobody', 'noc', 'none', 'noreply', 'notification', 'notifications', 'ns', 'ns0', 'ns1', 'ns2', 'ns3', 'ns4', 'ns5', 'ns6', 'ns7', 'ns8', 'ns9', 'null', 'oauth', 'oauth2', 'offer', 'offers', 'online', 'openid', 'order', 'orders', 'overview', 'owner', 'page', 'pages', 'partners', 'passwd', 'password', 'pay', 'payment', 'payments', 'photo', 'photos', 'pixel', 'plans', 'plugins', 'policies', 'policy', 'pop', 'pop3', 'popular', 'portfolio', 'post', 'postfix', 'postmaster', 'poweruser', 'preferences', 'premium', 'press', 'previous', 'pricing', 'print', 'privacy', 'privacy-policy', 'private', 'prod', 'product', 'production', 'profile', 'profiles', 'project', 'projects', 'public', 'purchase', 'put', 'quota', 'redirect', 'reduce', 'refund', 'refunds', 'register', 'registration', 'remove', 'replies', 'reply', 'report', 'request', 'request-password', 'reset', 'reset-password', 'response', 'return', 'returns', 'review', 'reviews', 'robots.txt', 'root', 'rootuser', 'rsa-sha2-2', 'rsa-sha2-512', 'rss', 'rules', 'sales', 'save', 'script', 'sdk', 'search', 'secure', 'security', 'select', 'services', 'session', 'sessions', 'settings', 'setup', 'share', 'shift', 'shop', 'signin', 'signup', 'site', 'sitemap', 'sites', 'smtp', 'sort', 'source', 'sql', 'ssh', 'ssh-rsa', 'ssl', 'ssladmin', 'ssladministrator', 'sslwebmaster', 'stage', 'staging', 'stat', 'static', 'statistics', 'stats', 'status', 'store', 'style', 'styles', 'stylesheet', 'stylesheets', 'subdomain', 'subscribe', 'sudo', 'super', 'superuser', 'support', 'survey', 'sync', 'sysadmin', 'system', 'tablet', 'tag', 'tags', 'team', 'telnet', 'terms', 'terms-of-use', 'test', 'testimonials', 'theme', 'themes', 'today', 'tools', 'topic', 'topics', 'tour', 'training', 'translate', 'translations', 'trending', 'trial', 'true', 'umac-128', 'umac-128-etm', 'umac-64', 'umac-64-etm', 'undefined', 'unfollow', 'unlike', 'unsubscribe', 'update', 'upgrade', 'usenet', 'user', 'username', 'users', 'uucp', 'var', 'verify', 'video', 'view', 'void', 'vote', 'webmail', 'webmaster', 'website', 'widget', 'widgets', 'wiki', 'wpad', 'write', 'www', 'www-data', 'www1', 'www2', 'www3', 'www4', 'you', 'yourname', 'yourusername', 'zlib',
    ];
    if (usernameBlacklist.includes(username)) {
      throw new Error("This username isn't available. Please try another.");
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Password min 6 characters.');
    }

    const newUser = await new User({
      fullName,
      email,
      username,
      password,
    }).save();

    let eventID = "5ddc12e18cdfc651b260921e";
    const event = await Event.findById(eventID);
    const newPoints = event.awardedPoints;

    // need to add if logic for if they have referral points from incoming url. 
    await User.findOneAndUpdate(
      { _id: newUser },
      { $set: { accountPoints: newPoints } }
    );

     // Set password reset token and it's expiry
     const token = generateToken(
      newUser,
      process.env.SECRET,
      EMAIL_TOKEN_EXPIRY
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    const mailOptions = {
      to: newUser.email,
      subject: 'Verify Your Email',
      html: verifyLink,
    };

    await sendEmail(mailOptions)

    return {
      token: token,
      message: `A link to verify your account has been sent to ${email}`,
    };
  },
  /**
   * Requests reset password
   *
   * @param {string} email
   */
  requestPasswordReset: async (root, { input: { email } }, { User }) => {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`No such user found for email ${email}.`);
    }

    // Set password reset token and it's expiry
    const token = generateToken(
      user,
      process.env.SECRET,
      EMAIL_TOKEN_EXPIRY
    );
    const tokenExpiry = Date.now() + EMAIL_TOKEN_EXPIRY;
    await User.findOneAndUpdate(
      { _id: user.id },
      { emailToken: token, emailTokenExpiry: tokenExpiry },
      { new: true }
    );

    // Email user reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${token}`;
    const mailOptions = {
      to: email,
      subject: 'Password Reset',
      html: resetLink,
    };

    await sendEmail(mailOptions);

    // Return success message
    return {
      message: `A link to reset your password has been sent to ${email}`,
    };
  },
  /**
   * Resets user password
   *
   * @param {string} email
   * @param {string} token
   * @param {string} password
   */
  resetPassword: async (
    root,
    { input: { email, token, password } },
    { User }
  ) => {
    if (!password) {
      throw new Error('Enter password and Confirm password.');
    }

    if (password.length < 6) {
      throw new Error('Password min 6 characters.');
    }

    // Check if user exists and token is valid
    const user = await User.findOne({
      email,
      emailToken: token,
      emailTokenExpiry: {
        $gte: Date.now() - EMAIL_TOKEN_EXPIRY,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!.');
    }

    // Update password, reset token and it's expiry
    user.emailToken = '';
    user.emailTokenExpiry = '';
    user.password = password;
    await user.save();

    // Return success message
    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },

  verifyAccount: async (
    root,
    { input: { email, token } },
    { User }
  ) => {

    // Check if user exists and token is valid
    const user = await User.findOneAndUpdate({
      email,
      emailToken: token,
      emailTokenExpiry: {
        $gte: Date.now() - EMAIL_TOKEN_EXPIRY,
      },
    }, { isVerified: true });

    if (!user) {
      throw new Error('This token is either invalid or expired!.');
    }

    await user.save();

    // Return success message
    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },
  /**
   * Uploads user Profile or Cover photo
   *
   * @param {string} id
   * @param {obj} image
   * @param {string} imagePublicId
   * @param {bool} isCover is Cover or Profile photo
   */
  uploadUserPhoto: async (
    root,
    { input: { id, image, imagePublicId, isCover } },
    { User }
  ) => {
    const { createReadStream } = await image;
    const stream = createReadStream();
    const uploadImage = await uploadToCloudinary(stream, 'user', imagePublicId);

    if (uploadImage.secure_url) {
      const fieldsToUpdate = {};
      if (isCover) {
        fieldsToUpdate.coverImage = uploadImage.secure_url;
        fieldsToUpdate.coverImagePublicId = uploadImage.public_id;
      } else {
        fieldsToUpdate.image = uploadImage.secure_url;
        fieldsToUpdate.imagePublicId = uploadImage.public_id;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { ...fieldsToUpdate },
        { new: true }
      )
        .populate('posts')
        .populate('likes');

      return updatedUser;
    }

    throw new Error(
      'Something went wrong while uploading image to Cloudinary.'
    );
  },
};

const Subscription = {
  /**
   * Subscribes to user's isOnline change event
   */
  isUserOnline: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(IS_USER_ONLINE),
      (payload, variables, { authUser }) => variables.authUserId === authUser.id
    ),
  },
};

export default { Query, Mutation, Subscription };