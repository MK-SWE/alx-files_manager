import dbClient from '../utils/db';

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
}
