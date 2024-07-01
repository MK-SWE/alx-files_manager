import { getStatus, getStats } from '../controllers/AppController';

// export the routes handeler function
export function setRoutes (app) {
  app.get('/status', getStatus);
  app.get('/stats', getStats);
}
