import cors from 'cors';
import dotenv from 'dotenv'
import helmet from 'helmet';
import morgan from "morgan";
import express from 'express';
import logger from "./utils/logger.js";
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit'


const config = dotenv.config();
const prisma = new PrismaClient()
const PORT = process.env.PORT || 8000;
const morganFormat = ":method :url :status :response-time ms";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json())
app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          // Log to file using winston
          logger.info(JSON.stringify(logObject));
  
          // Log to console (this will ensure it's printed in the terminal)
          console.log(message.trim());
        },
      },
    })
  );

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
  
app.use(limiter)
app.use('/api/v1/users', userRouter);
app.use('/api/loggin', authRouter);
// Middleware to disconnect Prisma after each request
app.use(async (req, res, next) => {
  try {
      await prisma.$disconnect();
  } catch (error) {
      console.error('Error disconnecting Prisma:', error);
  }
  next();
});

app.listen(PORT, () => {
    console.log(`server running now on http://localhost:${PORT}`);
})