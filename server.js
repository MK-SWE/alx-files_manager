import express from 'express';
import router from './routes/index';

const app = express();

// set the listening port
const PORT = process.env.PORT || 5000;

// make the app support json format
app.use(express.json({ limit: '5mb' }));
// Set the api routes using express router
app.use(router);

// start the app server
app.listen(PORT, () => {
  console.log('Server Is Running');
});

export default app;
