import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus (req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.send({ redis: true, db: true });
    }
  }

  static async getStats (request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    response.status(200).json({ users, files });
  }
}
