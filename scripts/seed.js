import User from '../models/User';
import { generateToken } from '../utils/generate-token';
const AUTH_TOKEN_EXPIRY = '1y';

const userFactory = User.fake();
console.log("fake gen" + userFactory)

const userSeed = new User(userFactory).save();
generateToken(userSeed, process.env.SECRET, AUTH_TOKEN_EXPIRY),
console.log("make fake user" + userSeed)
