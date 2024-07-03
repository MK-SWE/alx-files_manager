import { v4 as uuid } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AuthController {
  /**
   * Authenticate a user by Basic authentication and return a token
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Promise<void>}
   */
  static async getConnect (req, res) {
    const auth = req.headers.authorization;
    if (auth) {
      const [type, token] = auth.split(' ');
      if (type === 'Basic') {
        const [email, password] = Buffer.from(token, 'base64').toString().split(':');
        if (email && password) {
          try {
            const user = await dbClient
              .client
              .db()
              .collection('users')
              .findOne({ email });
            if (!user) {
              res.status(401).send({ error: 'Unauthorized' });
            }
            const hashed = sha1(password);
            if (user.password === hashed) {
              const token = uuid();
              await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
              res.status(200).send({ token });
            }
          } catch (error) {
            res.status(500).send();
          }
        }
      }
    }
  }

  /**
   * A function to disconnect a user by deleting the authentication token.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @return {Promise<void>}
   */
  static async getDisconnect (req, res) {
    const token = req.headers['x-token'];
    await redisClient.del(`auth_${token}`);
    res.status(200).send();
  }
}
