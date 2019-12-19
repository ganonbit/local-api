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
    firstName: String!
    lastName: String!
    email: String!
    username: String!
    birthday: String
    gender: String
    bio: String
    location: String
    phone: String
    password: String!
    emailToken: String
    emailTokenExpiry: String
    image: File
    imagePublicId: String
    coverImage: File
    coverImagePublicId: String
    isOnline: Boolean
    isVerified: Boolean
    isBanned: Boolean
    isGuru: Boolean
    isPick: Boolean
    role: String
    level: Int
    accountPoints: Int
    likePoints: Int
    commentPoints: Int
    sharePoints: Int
    referralPoints: Int
    gamePoints: Int
    totalPoints: Int
    pagesViewed: Int
    posts: [PostPayload]
    likes: [Like]
    comments: [Comment]
    followers: [Follow]
    following: [Follow]
    notifications: [NotificationPayload]
    badges: [Achievement]
    createdAt: String
    updatedAt: String
  }

  type Post {
    id: ID!
    content: String
    image: File
    imagePublicId: String
    author: User
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
    name: String
    action: String
    awardedPoints: Int
    createdAt: String
    updatedAt: String
  }

  type Achievement {
    id: ID!
    name: String
    action: String
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
    firstName: String!
    lastName: String!
    password: String!
    gender: String
    birthday: String
  }

  input RequestPasswordResetInput {
    email: String!
  }

  input ResetPasswordInput {
    email: String!
    token: String!
    password: String!
  }

  input VerifyAccountInput {
    email: String!
    token: String!
  }

  input UploadUserPhotoInput {
    id: ID!
    image: Upload!
    imagePublicId: String
    isCover: Boolean
  }

  input EditAccountInput {
    firstName: String
    lastName: String
    email: String
    username: String
    birthday: String
    gender: String
    bio: String
    location: String
    phone: String
    password: String
    image: String
    imagePublicId: String
    coverImage: String
    coverImagePublicId: String
    isOnline: Boolean
    isVerified: Boolean
    isBanned: Boolean
    isGuru: Boolean
    isPick: Boolean
    role: String
    level: Int
    accountPoints: Int
    likePoints: Int
    commentPoints: Int
    sharePoints: Int
    referralPoints: Int
    gamePoints: Int
    totalPoints: Int
    pagesViewed: Int
  }


  input CreatePostInput {
    content: String
    image: Upload
    imagePublicId: String
    authorId: ID!
  }

  input EditPostInput {
    content: String
    image: Upload
    imagePublicId: String
    id: ID
    authorId: ID
  }

  input DeletePostInput {
    id: ID!
    imagePublicId: String
  }
  
  input DeleteImageInput {
    id: ID
    imagePublicId: String!
    image: Upload
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

  input EditCommentInput {
    comment: String!
    image: Upload
    imagePublicId: String
    id: ID!
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
    eventName: String!
    eventAction: String!
    awardedPoints: Int!
  }

  input DeleteEventInput {
    id: ID!
  }

  input CreateAchievementInput {
    achievementName: String!
    achievementAction: String!
  }

  input DeleteAchievementInput {
    id: ID!
  }

  # ---------------------------------------------------------
  # Return Payloads
  # ---------------------------------------------------------
  type UserPayload {
    id: ID!
    firstName: String
    lastName: String
    email: String
    username: String
    birthday: String
    gender: String
    bio: String
    location: String
    phone: String
    password: String
    image: String
    imagePublicId: String
    coverImage: String
    coverImagePublicId: String
    isOnline: Boolean
    isVerified: Boolean
    isBanned: Boolean
    isGuru: Boolean
    isPick: Boolean
    role: String
    level: Int
    accountPoints: Int
    likePoints: Int
    commentPoints: Int
    sharePoints: Int
    referralPoints: Int
    gamePoints: Int
    totalPoints: Int
    pagesViewed: Int
    posts: [PostPayload]
    comments: [CommentPayload]
    likes: [Like]
    followers: [Follow]
    following: [Follow]
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

  type UserCommentsPayload {
    comments: [CommentPayload]!
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
    author: UserPayload
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
    firstName: String
    lastName: String
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
    id: ID!
    name: String
    action: String
    awardedPoints: Int
    createdAt: String
    updatedAt: String
  }

  type AchievementPayload {
    id: ID
    user: UserPayload
    name: String
    action: String
    createdAt: String
    updatedAt: String
  }

  type ImagePayload {
    image: String
    imagePublicId: String
  }

  

  # ---------------------------------------------------------
  # Query Root
  # ---------------------------------------------------------
  type Query {
    # Verifies reset password token
    verifyToken(email: String, token: String!): SuccessMessage

    # Gets the currently logged in user
    getAuthUser: UserPayload

    # Gets user by username or by id
    getUser(username: String, id: ID): UserPayload

    # Gets user posts by username
    getUserPosts(id:ID, username: String, skip: Int, limit: Int): UserPostsPayload

    # Gets user comments by username
    getUserComments(username: String!, skip: Int, limit: Int): UserCommentsPayload

    # Gets all users
    getUsers(userId: String!, skip: Int, limit: Int): UsersPayload

    # Searches users by username or name
    searchUsers(searchQuery: String!): [UserPayload]

    # Gets Suggested people for user
    suggestPeople(userId: String!): [UserPayload]

    # gets top users
    getTopUsers(userId: String!, skip: Int, limit: Int): [UserPayload]

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

    # Gets events by name
    getEvent(id: ID!): EventPayload

		# Gets achievements
		getAchievements(name: String, skip: Int, limit: Int): [AchievementPayload]

		# Gets user's achievements
		getUserAchievements(
			username: String
			userId: ID
			skip: Int
			limit: Int
		): [AchievementPayload]

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

		# Verifies user
		verifyAccount(input: VerifyAccountInput!): Token

		# Uploads user Profile or Cover photo
		uploadUserPhoto(input: UploadUserPhotoInput!): UserPayload

    # Edits a user
		editAccount(id: ID!, input: EditAccountInput!): UserPayload

    # Deletes a user
		deleteAccount(id: ID!): UserPayload

		# Creates a new post
		createPost(input: CreatePostInput!): PostPayload

  	# Edits a user post
		editPost(id: ID!, input: EditPostInput!): PostPayload

		# Deletes a user post
		deletePost(input: DeletePostInput!): PostPayload

    # Deletes a image
		deleteImage(input: DeleteImageInput!): ImagePayload

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

    # Edits a post comment
    editComment(input: EditCommentInput!): Comment

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

		# Deletes a achievement
		deleteUserAchievement(input: DeleteAchievementInput!): AchievementPayload
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
