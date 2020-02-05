import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { withFilter } from 'apollo-server';

import { uploadToCloudinary } from '../utils/cloudinary';
import { generateToken } from '../utils/generate-token';
import { sendEmail } from '../utils/email';
import verificationEmail from '../utils/email/verification-email';
import usernameBlackList from '../utils/username-black-list';
import deleteFollowsOfUser from '../utils/delete-follows-of-user';
import deleteUserComments from '../utils/delete-user-comments';
import deleteCommentsFromPostsOfUser from '../utils/delete-comments-from-posts-of-user';
import deleteUserLikes from '../utils/delete-user-likes';
import deleteLikesFromPostsOfUser from '../utils/delete-likes-from-posts-of-user';
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

    if (user && user.notifications) {
      user.newNotifications = user.notifications;
    }

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
        firstName: u.sender[0].firstName,
        lastName: u.sender[0].lastName,
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
    if (user) {
      user.newConversations = sortedConversations;
    }

    return user;
  },
  /**
   * Gets user by email
   *
   * @param {string} email
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

    if (await !user) {
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
  getUserPosts: async (root, { id, username, skip, limit }, { User, Post }) => {
    const user = await User.findOne({ username: username})
      .populate([{
        path: 'posts',
        populate: [
          { path: 'author',
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
          },
          { path: 'likes' },
          {
            path: 'comments',
            options: { sort: { createdAt: 'desc' } },
            populate: { path: 'author' },
          },
        ],
        options: { limit: limit, skip: skip }
      },
      {
        path: 'sharedPosts',
        populate: [
          { path: 'user', select: 'id firstName lastName username' },
          { path: 'post',
            populate: [
              { path: 'author', select: 'id firstName lastName username' },
              { path: 'likes' },
              {
                path: 'comments',
                options: { sort: { createdAt: 'desc' } },
                populate: { path: 'author' },
              },
            ],
          },
        ],
        options: { limit: limit, skip: skip }
      }])

    let combinedPosts = user.posts.concat(user.sharedPosts)
    const count = combinedPosts.length;
    const posts = combinedPosts.reverse();

    return { posts, count };
  },

  /**
   * Gets user posts by username
   *
   * @param {string} username
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getUserComments: async (
    root,
    { username, skip, limit },
    { User, Comment }
  ) => {
    const user = await User.findOne({ username }).select('_id');

    const query = { author: user._id };
    const count = await Comment.find(query).countDocuments();
    const comments = await Comment.find(query)
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
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { comments, count };
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
   * Searches users by username or name
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
        { firstName: new RegExp(searchQuery, 'i') },
        { lastName: new RegExp(searchQuery, 'i') },
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

  getTopUsers: async (root, { userId }, { User, Follow }) => {
    // Find who user follows
    const userFollowing = [];
    const following = await Follow.find(
      { follower: userId },
      { _id: 0 }
    ).select('user');
    following.map(f => userFollowing.push(f.user));
    userFollowing.push(userId);

    // Find top users
    const query = { _id: { $nin: userFollowing } };

    const topUsers = await User.find(query)
      .limit(20)
      .sort({ totalPoints: -1 });

    return topUsers;
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
   * @param {string} password
   */
  signin: async (root, { input: { email, password } }, { User }) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found.');
    }

    if (!user.isVerified) {
      throw new Error('Please confirm your email to login');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password.');
    }

    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },

  signup: async (
    root,
    { input: { firstName, lastName, email, username, password, invitedById } },
    { User, Event, Follow }
  ) => {
    // Check if user with given email or username already exists
    const user = await User.findOne().or([{ email }, { username }]);

    if (user) {
      const field = user.email === email ? 'email' : 'username';
      throw new Error(`User with given ${field} already exists.`);
    }

    // Empty field validation
    if (!firstName || !lastName || !email || !username || !password) {
      throw new Error('All fields are required.');
    }

    // name validation
    if (firstName.length > 20 && firstName.length < 2) {
      throw new Error('First name should be between 2-20 characters.');
    }
    if (lastName.length > 20 && lastName.length < 2) {
      throw new Error('Last name should be between 2-20 characters.');
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
    const usernameBlacklist = usernameBlackList();
    if (usernameBlacklist.includes(username)) {
      throw new Error("This username isn't available. Please try another.");
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Password min 6 characters.');
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password,
      referrerId: invitedById,
    })

    try {
      await newUser.save();
    } catch(error) {
      console.log('Following error ocurred while trying to save newUser')
      console.log(error)
      throw new Error(error);
    }

    let eventID = '5ddc12e18cdfc651b260921e';
    const event = await Event.findById(eventID);
    const newPoints = event.awardedPoints;

    const selma = await User.findOne({ username: 'selma', role: 'selma' });

    const following = await new Follow({
      user: selma.id,
      follower: newUser,
    }).save();

    const follower = await new Follow({
      user: newUser,
      follower: selma.id,
    }).save();

    const token = generateToken(
      newUser,
      process.env.SECRET,
      EMAIL_TOKEN_EXPIRY
    );
    let today = new Date();
    let tokenExpiry = new Date();
    // set token expiry to 30 days after today
    tokenExpiry.setDate(today.getDate()+30);

    // Push follower/following to user collection
    selma.following.push(follower.id)
    selma.followers.push(follower.id)
    newUser.following.push(following.id)
    newUser.followers.push(following.id)

    newUser.emailToken = token
    newUser.emailTokenExpiry = tokenExpiry
    newUser.accountPoints = newPoints
    newUser.totalPoints = newPoints

    try {
      await selma.save()
      await newUser.save()
    } catch(error) {
      console.log('Following error ocurred while trying to save selma and newUser')
      console.log(error)
      throw new Error(error);
    }

    // send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify?email=${email}&token=${token}`;
    const mailOptions = {
      to: newUser.email,
      subject: 'Verify Your Email',
      html: verificationEmail(verifyLink, newUser),
    };

    try {
      await sendEmail(mailOptions);
    } catch (error) {
      console.log('The following Error ocurred while trying to send an email:');
      console.error(error);
      throw new Error(error);
    }

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
    const token = generateToken(user, process.env.SECRET, EMAIL_TOKEN_EXPIRY);
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
      html: `
      <body style="padding: 0px;margin: 0 auto !important;-webkit-text-size-adjust: 100% !important;-ms-text-size-adjust: 100% !important;-webkit-font-smoothing: antialiased !important;">
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
              <tr>
                  <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
                      <table align="center" width="487" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                          <tr>
                              <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
                                  <!-- == Header Section == -->
                                      </td></tr><tr>
                                          <td style="background: #8fc42c;padding: 10px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                  <tr>
                                                      <td align="left" style="border-collapse: collapse;mso-line-height-rule: exactly;">
                                                          <a href="#" style="border-collapse: collapse;mso-line-height-rule: exactly;"><img width="53" src="https://res.cloudinary.com/weare270b/image/upload/f_auto,q_auto/v1576828740/email/avo-logo_csi56f.png" alt="" style="border: 0 !important;outline: none !important;"></a>
                                                      </td>
                                                      <td align="right" style="border-collapse: collapse;mso-line-height-rule: exactly;">
                                                          <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                              <tr>
                                                                  <td style="font-size: 16px;color: #ffffff;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding-right: 10px;border-collapse: collapse;mso-line-height-rule: exactly;">${user.firstName} ${user.lastName}</td>
                                                                  <td style="border-collapse: collapse;mso-line-height-rule: exactly;"><img width="40" src="https://res.cloudinary.com/weare270b/image/upload/f_auto,q_auto/v1576220262/static/Image_from_iOS_1_bnaxnc.jpg" alt="" style="border: 0 !important;outline: none !important;"></td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  <!-- == //Header Section == -->
      
                                  <!-- == Body Section == -->
                                      <tr>
                                          <td valign="top" style="padding-top: 25px;border: 1px solid #dee4e4;border-collapse: collapse;mso-line-height-rule: exactly;">
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                  <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">Hola, ${user.firstName}!</td>
                                                  </tr>
                                                   <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                        Avocado Nation - the first ever online community for avocado lovers!
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 10px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                        You can reset your password here:
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                    <td align="center" style="padding: 0 25px 16px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                        <tr>
                                                          <td style="width: 200px;height: 50px;border: 2px solid #9ac14a;text-align: center;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                            <a style="font-size: 20px;color: #9ac14a;text-decoration: none;font-family: 'Roboto Condensed', Arial, sans-serif;font-weight: 700;display: block;padding: 16px;border-radius: 3px;border-collapse: collapse;mso-line-height-rule: exactly;" href="${resetLink}">Reset Password</a>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 20px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                        Now what are you waiting for?! Share your avocado love!
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                        See you soon!
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td style="font-size: 18px;color: #4b4d4c;font-weight: bold;font-family: 'Roboto Condensed', Arial, sans-serif;padding: 0 25px 30px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                        Selma!
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                    <td style="border-collapse: collapse;mso-line-height-rule: exactly;">
                                                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                        <tr>
                                                          <td width="136" style="width: 136px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                            <img width="136" height="137" src="https://res.cloudinary.com/weare270b/image/upload/f_auto,q_auto/v1576828740/email/avatar-img2_jjodo2.png" alt="" style="border: 0 !important;outline: none !important;">
                                                          </td>
                                                          <td width="351" style="width: 351px;height: 117px;padding: 10px 60px;background: #40904b;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                              <tr>
                                                                <td style="font-size: 30px;color: #ffffff;font-weight: 700;font-family: 'Roboto Condensed', Arial, sans-serif;padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">Selma Avocado</td>
                                                              </tr>
                                                              <tr>
                                                                <td style="font-size: 16px;color: #8fbf2f;font-weight: normal;font-family: 'Roboto Condensed', Arial, sans-serif;font-style: italic;border-collapse: collapse;mso-line-height-rule: exactly;">The Self-Professed Avo Geek</td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  <!-- == //Body Section == -->
      
                                  <!-- == Footer Section == -->
                                      <tr>
                                          <td style="padding: 20px 50px;background: #f3f5f4;border-collapse: collapse;mso-line-height-rule: exactly;">
                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0px;mso-table-rspace: 0px;">
                                                 <tr>
                                                   <td align="center" style="font-size: 16px;text-align: center;padding-bottom: 25px;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                     You are receiving Avocado Nation notification emails.
                                                   </td>
                                                 </tr>
                                                 <tr>
                                                   <td align="center" style="font-size: 16px;text-align: center;padding-bottom: 25px;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                     This email was intended for ${user.firstName} ${user.lastName}.
                                                   </td>
                                                 </tr>
                                                 <tr>
                                                   <td align="center" style="padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                     <img width="130" src="https://res.cloudinary.com/weare270b/image/upload/f_auto,q_auto/v1576828740/email/avonation-logo_g1oi9v.png" alt="" style="border: 0 !important;outline: none !important;">
                                                   </td>
                                                 </tr>
                                                 <tr>
                                                   <td align="center" style="font-size: 16px;text-align: center;font-family: 'Roboto Condensed', Arial, sans-serif;padding-bottom: 5px;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                     © 2019 Avocado Nation
                                                   </td>
                                                 </tr>
                                                 <tr>
                                                   <td align="center" style="font-size: 16px;text-align: center;font-family: 'Roboto Condensed', Arial, sans-serif;border-collapse: collapse;mso-line-height-rule: exactly;">
                                                     222 West Las Colinas Boulevard Suite 850E, Irving, TX 75039.
                                                   </td>
                                                 </tr>
                                            </table>    
                                          </td>
                                      </tr>
                                  <!-- == //Footer Section == -->
                              </table></td>
                          </tr>
                      </table>
                  
              
          </body>`,
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

  verifyAccount: async (root, { input: { email, token } }, { User }) => {
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

    user.emailToken = '';
    user.emailTokenExpiry = '';
    user.isVerified = true;
    if (user.referrerId) {
      let invitedByUser = await User.findById(user.referrerId);
      invitedByUser.referredUserIds.push(user.id);
      invitedByUser.referralPoints = invitedByUser.referralPoints + 40;
      await invitedByUser.save();
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
        let optimizedImage = uploadImage.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'); 
        fieldsToUpdate.coverImage = await optimizedImage;
        fieldsToUpdate.coverImagePublicId = optimizedImage.public_id;
      } else {
        let optimizedImage = uploadImage.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'); 
        fieldsToUpdate.image = await optimizedImage;
        fieldsToUpdate.imagePublicId = optimizedImage.public_id;
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
  editAccount: async (root, { id, input }, { User }) => {
    const user = await User.findById(id);
    let genderTypes = ['male', 'female', 'custom'];
    let roleTypes = ['selma', 'expert', 'user'];
    // name validation
    if (
      input.firstName &&
      input.firstName.length > 20 &&
      input.firstName.length < 2
    ) {
      throw new Error('First name should be between 2-20 characters.');
    }
    if (
      input.lastName &&
      input.lastName.length > 20 &&
      input.lastName.length < 2
    ) {
      throw new Error('Last name should be between 2-20 characters.');
    }

    // Username validation
    const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
    if (input.username && !usernameRegex.test(input.username)) {
      throw new Error(
        'Usernames can only use letters, numbers, underscores and periods.'
      );
    }
    if (input.username && input.username.length > 20) {
      throw new Error('Username no more than 50 characters.');
    }
    if (input.username && input.username.length < 3) {
      throw new Error('Username min 3 characters.');
    }
    const usernameBlacklist = usernameBlackList();
    if (input.username && usernameBlacklist.includes(input.username)) {
      throw new Error("This username isn't available. Please try another.");
    }

    // Password validation
    if (input.password && input.password.length < 6) {
      throw new Error('Password min 6 characters.');
    }

    if (input.gender && genderTypes.includes(input.gender) === false) {
      throw new Error('Invalid gender selection');
    }

    if (input.role && roleTypes.includes(input.role) === false) {
      throw new Error('Invalid role selection');
    }

    const birthdayRegex = /^[0-9]{2}[-|\/]{1}[0-9]{2}[-|\/]{1}[0-9]{4}/;
    if (input.birthday && !birthdayRegex.test(input.birthday)) {
      throw new Error('Birthday must be in dd/mm/yyyy format.');
    }

    await User.findOneAndUpdate({ _id: id }, input, { new: true });

    // Return success message
    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },
  deleteAccount: async (
    root,
    { id, imagePublicId, image },
    { User, Post, Like, Comment }
  ) => {
    const user = await User.findById(id).populate('posts');
    if (user.role === 'selma') {
      throw new Error(
        'You cannot delete Selma via the API'
      )
    }
    await user.remove()

    // Remove post image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting image from Cloudinary'
        );
      }
    }

    deleteFollowsOfUser(user.id);
    deleteLikesFromPostsOfUser(user);
    deleteUserLikes(user);
    deleteCommentsFromPostsOfUser(user);
    deleteUserComments(user);
    await Post.deleteMany({ author: user.id });
    // await Notification.deleteMany({ author: user.id });
    await user.deleteObjectFromAlgolia();

    return user;
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
