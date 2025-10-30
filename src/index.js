require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error');

const app = express();

// ✅ Always enable CORS first
app.use(cors());

// ✅ Use ONLY ONE express.json() and express.urlencoded(), with limits
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// ✅ Optional health route
app.get('/health', (_, res) => res.json({ ok: true }));

// ✅ All your routes
app.use(routes);

// ✅ Centralized error handler
app.use(errorHandler);

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
