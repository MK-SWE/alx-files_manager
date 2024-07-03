import Queue from 'bull';
const redisConfig = { host: '127.0.0.1', port: 6379 }; // Update this with your Redis configuration

// Create a Bull queue for user-fileQueue jobs
const fileQueue = new Queue('fileQueue', { redis: redisConfig });
// Create a Bull queue for user-related jobs
const userQueue = new Queue('userQueue', { redis: redisConfig });

export default { userQueue };