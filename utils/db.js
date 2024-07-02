import { MongoClient } from 'mongodb';
import { env } from 'process';

const crypto = require('crypto');

// MongoDB client
class DBClient {
// Create a new instance of DBClient
  constructor() {
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
  isAlive() {
    return this.client.topology.isConnected();
  }

  /**
  * Get the number of users in the database
  * @returns {Promise<number>}
  */
  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  /**
  * Get the number of files in the database
  * @returns {Promise<number>}
  */
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  /**
  * Add a new user to the database
  * @param {String} email : The email of the user
  * @param {String} password : The password of the user
  * @returns {Promise<Object>}
  */
  async addUser(email, password) {
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = await this.client
      .db()
      .collection('users')
      .insertOne({ email, password: hashedPassword });
    return { _id: user.insertedId, email };
  }
}

const dbClient = new DBClient();
export default dbClient;