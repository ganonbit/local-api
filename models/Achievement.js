import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Achievement schema that has references to User, Like and Comment schemas
 */
const achievementSchema = Schema(
	{
		name: { type: String, required: true, unique: true },
		action: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Achievement', achievementSchema);
