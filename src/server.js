const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Trust proxy (required for Railway/Heroku/etc)
app.set('trust proxy', 1);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Native Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Optional modules (try-catch to prevent crash)
try {
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
} catch (err) {
  console.log('Cookie-parser not found, skipping');
}

try {
  const mongoSanitize = require('express-mongo-sanitize');
  app.use(mongoSanitize());
} catch (err) {
  console.log('Mongo-sanitize not found, skipping');
}

try {
  const helmet = require('helmet');
  app.use(helmet());
} catch (err) {
  console.log('Helmet not found, skipping');
}

try {
  const xss = require('xss-clean');
  app.use(xss());
} catch (err) {
  console.log('Xss-clean not found, skipping');
}

try {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
  });
  app.use(limiter);
} catch (err) {
  console.log('Rate-limit not found, skipping');
}

try {
  const hpp = require('hpp');
  app.use(hpp());
} catch (err) {
  console.log('Hpp not found, skipping');
}

// Route files
const auth = require('./routes/auth.routes');
const users = require('./routes/user.routes');
const tenants = require('./routes/tenant.routes');
const clients = require('./routes/client.routes');
const services = require('./routes/service.routes');
const products = require('./routes/product.routes');
const staff = require('./routes/staff.routes');
const orders = require('./routes/order.routes');

// Mount routers - Support BOTH /api/v1 and /api prefixes
const routes = [
  { path: '/auth', route: auth },
  { path: '/users', route: users },
  { path: '/tenants', route: tenants },
  { path: '/clients', route: clients },
  { path: '/services', route: services },
  { path: '/products', route: products },
  { path: '/staff', route: staff },
  { path: '/orders', route: orders }
];

routes.forEach(({ path, route }) => {
  app.use(`/api/v1${path}`, route); // Standard
  app.use(`/api${path}`, route);    // Fallback for frontend mismatch
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
