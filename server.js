import cors from 'cors';
import dotenv from 'dotenv'
import helmet from 'helmet';
import morgan from "morgan";
import express from 'express';
import logger from "./utils/logger.js";
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import cartRouter from './routes/cartRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import adminRouter from './routes/adminRouter.js'
import orderRouter from './routes/orderRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import wishlistRouter from './routes/wishlistRoutes.js';
import productsRouter from './routes/productsRouter.js'
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit'
import errorMiddleware from './middleware/errorMW.js';
import { checkUser, requireAuth } from './middleware/authMWPermission.js';
import { checkUserCart } from './middleware/userCartMW.js';

import './config/passport-config.js';

const config = dotenv.config();
const prisma = new PrismaClient()
const PORT = process.env.PORT || 8000;
const morganFormat = ":method :url :status :response-time ms";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));    // for handle `x-www-form-urlencoded` requests
app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'ejs');

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
  
app.get('*', checkUser, checkUserCart);
// app.use(limiter)

// routes
app.use(authRouter);
app.get('/products', (req, res, next) => res.render('products'));
app.get('/product/:id', (req, res, next) => res.render('product'));
app.use('/admin', adminRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/review', reviewRouter);
app.get('/', (req, res, next) => res.render('home'));

// Middleware to disconnect Prisma after each request
app.use(async (req, res, next) => {
  try {
      await prisma.$disconnect();
  } catch (error) {
      console.error('Error disconnecting Prisma:', error);
  }
  next();
});

app.use(errorMiddleware);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`server running now on http://localhost:${PORT}`);
})