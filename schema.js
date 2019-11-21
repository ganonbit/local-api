import { gql } from 'apollo-server-express';

/**
 * GraphQL Schema that describes the main functionality of the API
 *
 * https://www.apollographql.com/docs/apollo-server/schema/schema/
 */

const schema = gql`
  # ---------------------------------------------------------
  # Model and Root Query Objects
  # ---------------------------------------------------------
    
  type User {
    id: ID!
    fullName: String!
    email: String!
    username: String!
    birthday: String
    gender: String
    bio: String
    location: String
    password: String!
    resetToken: String
    resetTokenExpiry: String
    image: File
    imagePublicId: String
    coverImage: File
    coverImagePublicId: String
    isOnline: Boolean
    isVerified: Boolean
    isBlocked: Boolean
    role: String
    level: Int
    currentPoints: Int
    usedPoints: Int
    totalPoints: Int
    posts: [PostPayload]
    likes: [Like]
    comments: [Comment]
    followers: [Follow]
    following: [Follow]
    notifications: [NotificationPayload]
    events: [Event]
    badges: [Achievement]
    createdAt: String
    updatedAt: String
  }

  type Post {
    id: ID!
    content: String
    image: File
    imagePublicId: String
    author: User!
    likes: [Like]
    comments: [Comment]
    createdAt: String
    updatedAt: String
  }

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    message: String!
    image: File
    imagePublicId: String
    seen: Boolean
    createdAt: String
    updateAt: String
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Like {
    id: ID!
    post: ID
    user: ID
  }

  type Follow {
    id: ID!
    user: ID
    follower: ID
  }

  type Comment {
    id: ID!
    comment: String!
    image: File
    imagePublicId: String
    author: ID
    post: ID
    createdAt: String
  }

  enum NotificationType {
    LIKE
    FOLLOW
    COMMENT
  }

  type Notification {
    id: ID!
    user: User
    author: User
    post: ID!
    like: Like
    follow: Follow
    comment: Comment
    type: NotificationType
    seen: Boolean
    createdAt: String
  }

  type Event {
    id: ID!
    user: User
    name: String
    action: String
    awardedAmount: Int
    points: User
    achievements: Achievement
    createdAt: String
    updatedAt: String
  }

  type Achievement {
    id: ID!
    user: User
    name: String
    currentAmount: Int
    neededAmount: Int
    createdAt: String
    updatedAt: String
  }

  type Token {
    token: String!
  }

  type SuccessMessage {
    message: String!
  }

  # ---------------------------------------------------------
  # Input Objects
  # ---------------------------------------------------------
  input SignInInput {
    emailOrUsername: String!
    password: String
  }

  input SignUpInput {
    email: String!
    username: String!
    fullName: String!
    password: String!
  }

  input RequestPasswordResetInput {
    email: String!
  }

  input ResetPasswordInput {
    email: String!
    token: String!
    password: String!
  }

  input UploadUserPhotoInput {
    id: ID!
    image: Upload!
    imagePublicId: String
    isCover: Boolean
  }

  input CreatePostInput {
    content: String
    image: Upload
    imagePublicId: String
    authorId: ID!
  }

  input DeletePostInput {
    id: ID!
    imagePublicId: String
  }

  input CreateMessageInput {
    sender: ID!
    receiver: ID!
    message: String!
    image: Upload
    imagePublicId: String
  }

  input DeleteMessageInput {
    id: ID!
    imagePublicId: String
  }

  input CreateLikeInput {
    userId: ID!
    postId: ID!
  }

  input DeleteLikeInput {
    id: ID!
  }

  input CreateFollowInput {
    userId: ID!
    followerId: ID!
  }

  input DeleteFollowInput {
    id: ID!
  }

  input CreateCommentInput {
    comment: String!
    image: Upload
    imagePublicId: String
    author: ID!
    postId: ID!
  }

  input DeleteCommentInput {
    id: ID!
    imagePublicId: String
  }

  input CreateNotificationInput {
    userId: ID!
    authorId: ID!
    postId: ID
    notificationType: NotificationType!
    notificationTypeId: ID
  }

  input DeleteNotificationInput {
    id: ID!
  }

  input UpdateNotificationSeenInput {
    userId: ID!
  }

  input UpdateMessageSeenInput {
    sender: ID
    receiver: ID!
  }

  input CreateEventInput {
    userId: ID
    eventName: String!
    eventAction: String!
    awardedPoints: Int!
  }

  input DeleteEventInput {
    id: ID!
  }

  input CreateAchievementInput {
    userId: ID!
    achievementName: String!
    currentPoints: Int
    neededPoints: Int!
  }

  input DeleteAchievementInput {
    id: ID!
  }

  # ---------------------------------------------------------
  # Return Payloads
  # ---------------------------------------------------------
  type UserPayload {
    id: ID!
    fullName: String
    email: String
    username: String
    birthday: String
    gender: String
    bio: String
    location: String
    password: String
    image: String
    imagePublicId: String
    coverImage: String
    coverImagePublicId: String
    isOnline: Boolean
    isVerified: Boolean
    isBlocked: Boolean
    role: String
    level: Int
    currentPoints: Int
    usedPoints: Int
    totalPoints: Int
    posts: [PostPayload]
    likes: [Like]
    followers: [Follow]
    following: [Follow]
    events: [Event]
    badges: [Achievement]
    notifications: [NotificationPayload]
    newNotifications: [NotificationPayload]
    newConversations: [ConversationsPayload]
    unseenMessage: Boolean
    createdAt: String
    updatedAt: String
  }

  type UserPostsPayload {
    posts: [PostPayload]!
    count: String!
  }

  type UsersPayload {
    users: [UserPayload]!
    count: String!
  }

  type PostPayload {
    id: ID!
    content: String
    image: String
    imagePublicId: String
    author: UserPayload!
    likes: [Like]
    comments: [CommentPayload]
    createdAt: String
    updatedAt: String
  }

  type PostsPayload {
    posts: [PostPayload]!
    count: String!
  }

  type MessagePayload {
    id: ID!
    receiver: UserPayload
    sender: UserPayload
    message: String
    image: String
    imagePublicId: String
    seen: Boolean
    createdAt: String
    isFirstMessage: Boolean
  }

  type IsUserOnlinePayload {
    userId: ID!
    isOnline: Boolean
  }
  type ConversationsPayload {
    id: ID!
    username: String
    fullName: String
    image: String
    isOnline: Boolean
    seen: Boolean
    lastMessage: String
    lastMessageSender: Boolean
    lastMessageCreatedAt: String
  }
  
  type LikePayload {
    id: ID!
    post: PostPayload
    user: UserPayload
  }

  type NotificationPayload {
    id: ID
    user: UserPayload
    author: UserPayload
    like: LikePayload
    follow: Follow
    comment: CommentPayload
    createdAt: String
  }

  type NotificationsPayload {
    count: String!
    notifications: [NotificationPayload]!
  }

  type CommentPayload {
    id: ID
    comment: String
    image: String
    imagePublicId: String
    author: UserPayload
    post: PostPayload
    createdAt: String
  }

  type EventPayload {
    id: ID
    user: UserPayload
    name: String
    action: String
    awardedAmount: Int
    points: UserPayload
    achievements: AchievementPayload
    createdAt: String
    updatedAt: String
  }

  type AchievementPayload {
    id: ID
    user: UserPayload
    name: String
    currentAmount: Int
    neededAmount: Int
    createdAt: String
    updatedAt: String
  }

  # ---------------------------------------------------------
  # Query Root
  # ---------------------------------------------------------
  type Query {
    # Verifies reset password token
    verifyResetPasswordToken(email: String, token: String!): SuccessMessage

    # Gets the currently logged in user
    getAuthUser: UserPayload

    # Gets user by username or by id
    getUser(username: String, id: ID): UserPayload

    # Gets user posts by username
    getUserPosts(username: String!, skip: Int, limit: Int): UserPostsPayload

    # Gets all users
    getUsers(userId: String!, skip: Int, limit: Int): UsersPayload

    # Searches users by username or fullName
    searchUsers(searchQuery: String!): [UserPayload]

    # Gets Suggested people for user
    suggestPeople(userId: String!): [UserPayload]

    # Gets posts from followed users
    getFollowedPosts(userId: String!, skip: Int, limit: Int): PostsPayload

    # Gets all posts
    getPosts(authUserId: ID!, skip: Int, limit: Int): PostsPayload

    # Gets post by id
    getPost(id: ID!): PostPayload

    # Gets notifications for specific user
    getUserNotifications(
      userId: ID!
      skip: Int
      limit: Int
    ): NotificationsPayload

    # Gets user's messages
    getMessages(authUserId: ID!, userId: ID!): [MessagePayload]

    # Gets user's conversations
    getConversations(authUserId: ID!): [ConversationsPayload]

    # Gets user's events by user id
    getUserEvents(userId: ID!, skip: Int, limit: Int): [EventPayload]

    # Gets user's achievements
    getUserAchievements(username: String, userId: ID, skip: Int, limit: Int): [AchievementPayload]

    # Searches events by name or action
    searchEvents(searchQuery: String!): [EventPayload]

    # Searches achievements by user or name
    searchAchievements(searchQuery: String!): [AchievementPayload]
  }
  # ---------------------------------------------------------
  # Mutation Root
  # ---------------------------------------------------------
  type Mutation {
    # Signs in user
    signin(input: SignInInput!): Token

    # Signs up user
    signup(input: SignUpInput!): Token

    # Requests reset password
    requestPasswordReset(input: RequestPasswordResetInput!): SuccessMessage

    # Resets user password
    resetPassword(input: ResetPasswordInput!): Token

    # Uploads user Profile or Cover photo
    uploadUserPhoto(input: UploadUserPhotoInput!): UserPayload

    # Creates a new post
    createPost(input: CreatePostInput!): PostPayload

    # Deletes a user post
    deletePost(input: DeletePostInput!): PostPayload

    # Creates a like for post
    createLike(input: CreateLikeInput!): Like

    # Deletes a post like
    deleteLike(input: DeleteLikeInput!): Like

    # Creates a following/follower relationship between users
    createFollow(input: CreateFollowInput!): Follow

    # Deletes a following/follower relationship between users
    deleteFollow(input: DeleteFollowInput!): Follow

    # Creates a post comment
    createComment(input: CreateCommentInput!): Comment

    # Uploads user comment photo


    # Deletes a post comment
    deleteComment(input: DeleteCommentInput!): Comment

    # Creates a new notification for user
    createNotification(input: CreateNotificationInput!): Notification

    # Deletes a notification
    deleteNotification(input: DeleteNotificationInput!): Notification

    # Updates notification seen values for user
    updateNotificationSeen(input: UpdateNotificationSeenInput!): Boolean

    # Creates a message
    createMessage(input: CreateMessageInput!): MessagePayload

    # Deletes a message
    deleteMessage(input: DeleteMessageInput!): MessagePayload

    # Updates message seen values for user
    updateMessageSeen(input: UpdateMessageSeenInput!): Boolean

    # Creates a event
    createEvent(input: CreateEventInput!): EventPayload

    # Deletes a event
    deleteEvent(input: DeleteEventInput!): EventPayload

    # Creates a achievement
    createAchievement(input: CreateAchievementInput!): AchievementPayload

    # Deletes a achievement
    deleteAchievement(input: DeleteAchievementInput!): AchievementPayload
  }

  # ---------------------------------------------------------
  # Mutation Root
  # ---------------------------------------------------------
  type Subscription {
    messageCreated(authUserId: ID!, userId: ID!): MessagePayload
    isUserOnline(authUserId: ID!, userId: ID!): IsUserOnlinePayload
    newConversation: ConversationsPayload
  }
`;

export default schema;
