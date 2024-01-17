import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';

import express from 'express';

const app = express();
dotenv.config({
  path: './.env',
});

//Setting up mongoo db connection instance
;(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}${DB_NAME}`
    );
    console.log(connectionInstance);
    app.on('error', (error) => {
      console.log(`error ${error}`);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(
        `the server is running on https://localhost:${process.env.PORT}`
      );
    });
  } catch (error) {
    console.warn(`ERROR: ${error}`);
  }
})();
