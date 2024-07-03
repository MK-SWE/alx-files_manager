import { MongoClient, ObjectId } from 'mongodb';
import { env } from 'process';
import sha1 from 'sha1';
import isValidId from './id_validator';

// MongoDB client
class DBClient {
// Create a new instance of DBClient
  constructor () {
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || 27017;
    const database = env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
  * Check the connection status of the client
  * @returns {boolean} true if the client is connected to the database
  */
  isAlive () {
    return this.client.topology.isConnected();
  }

  /**
  * Get the number of users in the database
  * @returns {Promise<number>}
  */
  async nbUsers () {
    return this.client.db().collection('users').countDocuments();
  }

  /**
  * Get the number of files in the database
  * @returns {Promise<number>}
  */
  async nbFiles () {
    return this.client.db().collection('files').countDocuments();
  }

  /**
  * Add a new user to the database
  * @param {String} email : The email of the user
  * @param {String} password : The password of the user
  * @returns {Promise<Object>}
  */
  async addUser (email, password) {
    const hashedPassword = sha1(password);
    const user = await this.client
      .db()
      .collection('users')
      .insertOne({ email, password: hashedPassword });
    return { _id: user.insertedId, email };
  }

  /**
 * Retrieves a user from the database based on the provided ID.
 *
 * @param {string} id - The ID of the user.
 * @return {Promise<Object>} A Promise that resolves to the user object.
 */
  async getUser (id) {
    console.log(id);
    try {
      const user = await this.client
        .db()
        .collection('users')
        .findOne({ _id: new ObjectId(id) });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Retrieves a file from the database based on the provided ID.
   * @param {string} id - The ID of the file.
   * @return {Promise<Object>} A Promise that resolves to the file object.
   */
  async getFile (id) {
    const file = await this.client
      .db()
      .collection('files')
      .findOne({ parentId: id });
    return file;
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection () {
    return this.client.db().collection('users');
  }

  /**
   * Retrieves a reference to the `files` collection.
   * @returns {Promise<Collection>}
   */
  async filesCollection () {
    return this.client.db().collection('files');
  }
}

const dbClient = new DBClient();
export default dbClient;
