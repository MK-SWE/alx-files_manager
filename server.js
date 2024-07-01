import express from 'express';
import { setRoutes } from './routes/index';

const app = express();

// set the listening port
const PORT = process.env.PORT || 5000;

// Set the api routes using routes/index.js
setRoutes(app);

// start the app server
app.listen(PORT, () => {
  console.log('Server Is Running');
});
