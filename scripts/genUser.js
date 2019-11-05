import User from '../models/User';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const saveFakeUser = async () => {
  const userFactory = User.fake();
  // console.log("generate fake user data: \n" + userFactory)
  const userSeed =
    await new User(userFactory)
    .save(function (err, data) {
      if (err) {
        console.log('The following error ocurred:')
        console.log(err)
      }
      console.log("create new user with fake data: \n" + data)
      // mongoose.connection.close()
    });
}

// saveFakeUser()

saveFakeUser();
let callCount = 1;
const repeater = setInterval(function () {
  if (callCount < 1000) {
    saveFakeUser();
    callCount += 1;
  } else {
    clearInterval(repeater);
    mongoose.connection.close()
  }
}, 2000);