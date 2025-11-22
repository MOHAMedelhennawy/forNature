import cors from 'cors';
import dotenv from 'dotenv'
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import cartRouter from './routes/cartRouter.js';
import cartItemRouter from './routes/catrItemsRouter.js'
import reviewRouter from './routes/reviewRouter.js';
import adminRouter from './routes/adminRouter.js'
import orderRouter from './routes/orderRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import wishlistRouter from './routes/wishlistRoutes.js';
import productsRouter from './routes/productsRouter.js'
import errorMiddleware from './middleware/errorMW.js';
import { checkUser, requireAuth } from './middleware/authMWPermission.js';
import { checkUserCart } from './middleware/userCartMW.js';
import morganMiddleware from './config/morgan-config.js';
import rateLimitConfig from './config/rateLitmit-config.js';

import './config/passport-config.js';

const config = dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));    // for handle `x-www-form-urlencoded` requests
app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(morganMiddleware);

const limiter = rateLimitConfig()
  
// app.get('*', checkUser, checkUserCart);
// app.use(limiter)

// Web Routes
app.get('/products', (req, res, next) => res.render('products'));
app.get('/product/:id', (req, res, next) => res.render('product'));
app.get('/', (req, res, next) => res.render('home'));

// API Routes
app.use(authRouter);
app.use('/admin', adminRouter);
app.use('/api/v1/users', userRouter);   // done
app.use('/api/v1/products', productsRouter); // done
app.use('/api/v1/cart', checkUser, cartRouter); // done
app.use('/api/v1/cart/item', checkUser, checkUserCart, cartItemRouter); 
// app.use('/api/v1/wishlist', wishlistRouter);
// app.use('/api/v1/order', orderRouter);
// app.use('/api/v1/category', categoryRouter);
// app.use('/api/v1/review', reviewRouter);

app.use(errorMiddleware);

export default app;

