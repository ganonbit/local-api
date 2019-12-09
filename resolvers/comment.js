const Mutation = {
	/**
	 * Creates a post comment
	 * @param {string} image
	 * @param {string} comment
	 * @param {string} author author id
	 * @param {string} postId
	 */
	createComment: async (
		root,
		{ input: { image, comment, author, postId } },
		{ Comment, Post, User, Event }
	) => {
		let imageUrl, imagePublicId;
		if (image) {
			const { createReadStream } = await image;
			const stream = createReadStream();
			const uploadImage = await uploadToCloudinary(stream, 'post');

			if (!uploadImage.secure_url) {
				throw new Error(
					'Something went wrong while uploading image to Cloudinary'
				);
			}

			imageUrl = uploadImage.secure_url;
			imagePublicId = uploadImage.public_id;
		}

		const newComment = await new Comment({
			image: imageUrl,
			imagePublicId,
			comment,
			author,
			post: postId,
		}).save();

		let eventID = '5ddc0cdfdce3c14fcbc210bb';
		const event = await Event.findById(eventID);
		const user = await User.findById(newComment.author);
		const newPoints = user.commentPoints + event.awardedPoints;

		// Push comment to post collection
		await Post.findOneAndUpdate(
			{ _id: postId },
			{ $push: { comments: newComment.id } }
		);
		// Push comment to user collection
		await User.findOneAndUpdate(
			{ _id: author },
			{
				$push: { comments: newComment.id },
				$set: { commentPoints: newPoints },
			}
		);

		return newComment;
	},

	editComment: async (
		root,
		{ input: { image, id, author, postId } },
		{ Comment, Post, User }
	) => {
		let imageUrl, imagePublicId;
		if (image) {
			const { createReadStream } = await image;
			const stream = createReadStream();
			const uploadImage = await uploadToCloudinary(stream, 'post');

			if (!uploadImage.secure_url) {
				throw new Error(
					'Something went wrong while uploading image to Cloudinary'
				);
			}

			imageUrl = uploadImage.secure_url;
			imagePublicId = uploadImage.public_id;
		}

		const updatedComment = await Comment.findOneAndUpdate(
			{ _id: id },
			{ $push:
				{
					image: imageUrl,
					imagePublicId,
					comment,
				}
			});

		// Push comment to post collection
		await Post.findOneAndUpdate(
			{ _id: postId },
			{ $push: { comments: updatedComment.id } }
		);
		// Push comment to user collection
		await User.findOneAndUpdate(
			{ _id: author },
			{
				$push: { comments: updatedComment.id }
			}
		);

		return editComment;
	},
	/**
	 * Deletes a post comment
	 *
	 * @param {string} id
	 */
	deleteComment: async (
		root,
		{ input: { id, imagePublicId } },
		{ Comment, User, Post, Event }
	) => {
		// Remove comment image from cloudinary, if imagePublicId is present
		if (imagePublicId) {
			const deleteImage = await deleteFromCloudinary(imagePublicId);

			if (deleteImage.result !== 'ok') {
				throw new Error(
					'Something went wrong while deleting image from Cloudinary'
				);
			}
		}
		const comment = await Comment.findByIdAndRemove(id);

		const user = await User.findById(comment.author);
		let eventID = '5ddc0cdfdce3c14fcbc210bb';
		const event = await Event.findById(eventID);
		const newPoints = user.commentPoints - event.awardedPoints;

		// Delete comment from users collection
		await User.findOneAndUpdate(
			{ _id: comment.author },
			{
				$pull: { comments: comment.id },
				$set: { commentPoints: newPoints },
			}
		);
		// Delete comment from posts collection
		await Post.findOneAndUpdate(
			{ _id: comment.post },
			{ $pull: { comments: comment.id } }
		);

		return comment;
	},
};

export default { Mutation };
