import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import { app } from './app.js';

dotenv.config({
  path: './.env',
});

// Setting up mongoo db connection instance
(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}${DB_NAME}`
    );
    app.on('error', (error) => {
      console.log(`error ${error}`);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(
        `❁ the server is running on https://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.warn(`ERROR: ${error}`);
  }
})();
