import mongoose from 'mongoose';
import faker from 'faker';
import Post from '../models/Post';

 const userFactory = [
  {
    email: faker.internet.email(),
    fullName: faker.name.findName(),
    password: faker.internet.password(),
    username: faker.internet.userName(),
    birthday: faker.date.past(),
    bio: faker.lorem.words(6),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    isVerified: true,
    isBlocked: false,
      posts: [
          'ref:posts._id',
          'ref:posts._id'
      ]
  }
]

export default userFactory;