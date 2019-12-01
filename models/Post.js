import mongoose from 'mongoose';
mongoose.plugin(require('@lykmapipo/mongoose-faker'));

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const postSchema = Schema(
	{
		content: {
			type: String,
			fake: {
				generator: 'lorem',
				type: 'paragraph',
			},
		},
		image: {
			type: String,
			// fake: {
			//   generator: 'image',
			//   type: 'avatar'
			// }
		},
		imagePublicId: String,
		isFeatured: { type: Boolean, default: false },
		isPublic: { type: Boolean, default: false },
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Like',
			},
		],
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Comment',
			},
		],
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Post', postSchema);
