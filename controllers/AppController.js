import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * check if the redis server and mongo db is running
 * @returns { redis: true, db: true }, status code 200 if services are running
 *          or 503 503 status code if one of them not running
 *          or 500 if another error happend
 */
export function getStatus (req, res) {
  try {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    if (!redisAlive || !dbAlive) {
      res.status(503).send('One or more services are unavailable.');
      return;
    }
    res.send({ redis: true, db: true });
  } catch (error) {
    res.status(500).send('An error occurred.');
  }
}

/**
 * get number of users and files from the database
 * @returns number of users and files available with 200 status code
 *         or 503 status code if the database not avaliable
 *         or 500 if another error happend
 */
export function getStats (req, res) {
  try {
    const dbAlive = dbClient.isAlive();
    if (!dbAlive) {
      res.status(503).send('Database not avaliable');
      return;
    }
    const users = dbClient.nbUsers();
    const files = dbClient.nbFiles();
    res.send({ users, files });
  } catch (error) {
    res.status(500).send('An error occurred.');
  }
}
