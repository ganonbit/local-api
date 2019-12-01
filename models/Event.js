import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Event schema that has references to User, Like and Comment schemas
 */
const eventSchema = Schema(
	{
		name: { type: String, required: true, unique: true },
		action: { type: String, required: true },
		awardedPoints: { type: Number, required: true, default: 0 },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Event', eventSchema);
