import mongoose from "mongoose";

const connectDB = async (url) => {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB successfully");
};

export default connectDB;
