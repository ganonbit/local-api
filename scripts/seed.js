import User from '../models/User';
import { generateToken } from '../utils/generate-token';
const AUTH_TOKEN_EXPIRY = '1y';

const userFactory = User.fake();
console.log("generate fake user data: \n" + userFactory)

const userSeed = new User(userFactory);
userSeed.markModified('user');
userSeed.save(function(error,data){
    if (error) {
        console.log(error); 
    }
    console.log(data + " saved to the DB"); 
    res.json({ token: generateToken(userSeed, process.env.SECRET, AUTH_TOKEN_EXPIRY), user: data });
});

