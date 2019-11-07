import User from '../models/User';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

require('events').EventEmitter.defaultMaxListeners = 50
export let numberOfUsers = 50;

const saveFakeUser = async () => {
  const userFactory = User.fake(numberOfUsers);
  for (let [key, value] of Object.entries(userFactory)) {
    const userSeed =
      await new User(value)
      .save(function (err, data) {
        if (err) {
          console.log('The following error ocurred:')
          console.log(err)
        }
        mongoose.connection.close();
      })
  }
}
saveFakeUser();