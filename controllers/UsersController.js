import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UserController {
  /**
     * Post a new user to the database
     * @param request {Object} : The request object
     * @param response {Object} : The response object
     * @returns {Promise<Object>}
     */
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email || !password) {
      const message = { error: `Missing ${email ? 'password' : 'email'}` };
      response.status(400).json(message);
    }
    if (!await dbClient.client.db().collection('users').findOne({ email })) {
      const user = await dbClient.addUser(email, password);
      response.status(201).json(user);
    } else {
      const message = { error: 'Already exist' };
      response.status(400).json(message);
    }
  }

  /**
   * Retrieves the user information associated with the provided token.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise<void>} - A promise that resolves when the user information
   *     is retrieved and sent as a JSON response.
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userID = await redisClient.get(`auth_${token}`);
    if (!userID) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const user = await dbClient.getUser(userID);
    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}
