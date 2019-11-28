import {} from "dotenv/config";
import User from "../models/User";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const syncUsersInAlgolia = async () => {
  try {
    await User.syncWithAlgolia();
    console.log("finished successfully!");
  } catch (error) {
    console.log("The following Error ocurred:");
    console.error(error);
  }
  mongoose.connection.close();
};

syncUsersInAlgolia();
