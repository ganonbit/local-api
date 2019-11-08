import {} from 'dotenv/config';
import User from '../models/User';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

require('events').EventEmitter.defaultMaxListeners = 50
const numberOfUsers = 100;

const saveFakeUsers = async () => {
  const userFactories = User.fake(numberOfUsers);

  await Promise.all(userFactories.map(async (userFactory) => {
    return await new User(userFactory).save()
  }))
}

const generateFakeUsers = async () => {
  await saveFakeUsers();
  mongoose.connection.close();
}

generateFakeUsers();
