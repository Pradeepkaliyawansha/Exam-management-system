const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/exam-management";
    console.log("Attempting to connect to MongoDB at:", mongoURI);

    // Set strictQuery to false for more flexible querying
    mongoose.set("strictQuery", false);

    // Set up connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Set a timeout for the connection attempt
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up event listeners for connection issues
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });

    return conn;
  } catch (err) {
    console.error("MongoDB connection error details:", err);

    // Provide more specific error based on error type
    if (err.name === "MongoServerSelectionError") {
      console.error(
        "Could not connect to any MongoDB servers. Please check your MongoDB installation or connection string."
      );
    } else if (err.name === "MongoParseError") {
      console.error(
        "Invalid MongoDB connection string. Please check your MONGO_URI in the .env file."
      );
    }

    // Exit process with failure
    console.error("Application terminating due to database connection failure");
    process.exit(1);
  }
};

module.exports = connectDB;
