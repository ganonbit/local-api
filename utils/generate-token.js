import jwt from 'jsonwebtoken';

/**
 * Generates a token for user
 *
 * @param {object} user
 * @param {string} secret
 * @param {date} expiresIn
 */
export const generateToken = (user, secret, expiresIn) => {
	const { id, firstName, lastName, email } = user;

	return jwt.sign({ id, firstName, lastName, email }, secret, { expiresIn });
};
