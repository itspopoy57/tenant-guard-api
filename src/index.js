require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error');

const app = express();

// allow mobile app to call API
app.use(cors());

// body parsing (15mb for photos)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// health check
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

// all API routes
app.use(routes);
app.use('/users', require('./routes/users.routes'));


// error handling middleware (must be last)
app.use(errorHandler);

// IMPORTANT: use Railway's PORT if it exists
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
