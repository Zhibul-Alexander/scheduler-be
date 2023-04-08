import express, {Express} from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoute from './server/routes/auth.js';

const app: Express = express();
dotenv.config();

// Constants
const PORT = process.env.PORT || 3005;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // for parsing application/json

// Routes
app.use('/api/auth', authRoute);

const init = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.bbst6ig.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

init().catch(console.error);