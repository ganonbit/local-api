import User from '../models/User';
import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://270B_dev:lWAD4DWssdTbOyKW@avonation-zh1xu.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const saveFakeUser = async () => {
  const userFactory = User.fake();
  console.log("generate fake user data: \n" + userFactory)
  const userSeed =
    await new User(userFactory)
    .save(function (err) {
      if (err) {
        console.log('The following error ocurred:')
        console.log(err)
      }
      mongoose.connection.close()
    });
  console.log("create new user with fake data: \n" + userSeed)
}

saveFakeUser()
