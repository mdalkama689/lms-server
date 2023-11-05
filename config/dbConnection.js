import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (connection) {
      console.log(`connect to BD : ${connection.host}`);
    }
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
export default connectToDB;
