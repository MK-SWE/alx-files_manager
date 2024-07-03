import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Redis Client Module
 */

export class RedisClient {
  // Creates a new redis client and connect to the server

  constructor() {
    this.client = createClient();
    this.conected = true;
    this.client
      .on('connect', () => {
        this.conected = true;
      })
      .on('error', (error) => {
        const err = error.message || error.toString();
        console.error(`Connection to redis server failed: ${err}`);
        this.conected = false;
      });
  }

  /**
     * Check if the client is connected to the Redis server
     * @returns {boolean}
     */
  isAlive() { return this.conected; }

  /**
     * Get the value of a key in the Redis store
     * @param {String} key : The key to get the value of
     * @returns {Promise<String | Object | null>}
     */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
     * Set a key in the Redis store with an expiration time
     * @param {String} key : The key to set
     * @param {String | Object} value : The value to set the key to
     * @param {Number} duration : The expiration time in seconds
     * @returns {Promise<void>}
     */
  async set(key, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  /**
     * Delete a key from the Redis store
     * @param {String} key : The key to delete
     * @returns {Promise<void>}
     */
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
