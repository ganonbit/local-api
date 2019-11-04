import User from '../models/User';
import { generateToken } from '../utils/generate-token';
const AUTH_TOKEN_EXPIRY = '1y';

const userFactory = User.fake();
console.log("generate fake user data: \n" + userFactory)

const userSeed = new User(userFactory).save();
generateToken(userSeed, process.env.SECRET, AUTH_TOKEN_EXPIRY),
console.log("create new user with fake data: \n" + userSeed)
