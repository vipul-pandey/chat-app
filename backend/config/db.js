const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  // mongoose.connect(process.env.MONGO_URI)
  //   .then(() => console.log('MongoDB Connected'))
  //   .catch((err) => console.error(err));
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection timeout settings
      serverSelectionTimeoutMS: 10000, // 10 seconds to find server
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      // Retry settings for transient failures
      retryWrites: true,
      retryReads: true,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Heartbeat to keep connection alive
      heartbeatFrequencyMS: 30000, // Ping every 30 seconds
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;

