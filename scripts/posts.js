import mongoose from 'mongoose';
import faker from 'faker';
import User from '../models/User';

// const usersIds = User
//   .find()
//   .populate('users') // <==
//   .exec(function(err, users){
//       console.log(err);
//       console.log(users);
//   });

//   console.log(usersIds);

  const postFactory = [
  {
    content: faker.lorem.words(5),
    image: faker.image.food(),
    // author: usersIds,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  }
]

export default postFactory;
