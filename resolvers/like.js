// import { earnBadge } from '../utils/badges';

const Mutation = {
	/**
	 * Creates a like for post
	 *
	 * @param {string} userId
	 * @param {string} postId
	 */
	createLike: async (
		root,
		{ input: { userId, postId } },
		{ Like, Post, User, Event }
	) => {
		const like = await new Like({ user: userId, post: postId }).save();
		const user = await User.findById(like.user);
		let eventID = '5dda290bcd879c3e998e2a48';
		const event = await Event.findById(eventID);
		const newPoints = user.likePoints + event.awardedPoints;
		const totalPoints = user.totalPoints + event.awardedPoints;

		// Push like to post collection
		await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: like.id } });
		// Push like and add points to user collection
		await User.findOneAndUpdate(
			{ _id: userId },
			{ $push: { likes: like.id }, $set: { likePoints: newPoints, totalPoints: totalPoints } }
		);

		// await earnBadge();

		return like;
	},
	/**
	 * Deletes a post like
	 *
	 * @param {string} id
	 */
	deleteLike: async (
		root,
		{ input: { userId, id } },
		{ Like, User, Post, Event }
	) => {
		const like = await Like.findByIdAndRemove(id);
		const user = await User.findById(like.user);
		let eventID = '5dda290bcd879c3e998e2a48';
		const event = await Event.findById(eventID);
		const newPoints = user.likePoints - event.awardedPoints;
		const totalPoints = user.totalPoints - event.awardedPoints;

		// Delete like from users collection
		await User.findOneAndUpdate(
			{ _id: like.user },
			{ $pull: { likes: like.id }, $set: { likePoints: newPoints, totalPoints: totalPoints } }
		);
		// Delete like from posts collection
		await Post.findOneAndUpdate(
			{ _id: like.post },
			{ $pull: { likes: like.id } }
		);

		return like;
	},
};

export default { Mutation };
