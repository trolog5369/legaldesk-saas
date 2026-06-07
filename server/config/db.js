const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // In Mongoose 9+, these options are true by default and passing them directly throws an error.
    // We delete them dynamically before passing to prevent runtime crash while ensuring they are defined.
    const mongooseOptions = { ...options };
    delete mongooseOptions.useNewUrlParser;
    delete mongooseOptions.useUnifiedTopology;

    const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during database disconnection:', err.message);
    process.exit(1);
  }
});

module.exports = connectDB;
