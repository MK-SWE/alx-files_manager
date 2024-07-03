// Import necessary libraries and tools
import { use, expect as _expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app'; // Assuming the Express app is exported from app.js

// Configure chai
use(chaiHttp);
const expect = _expect;
// Tests for RedisClient

describe('RedisClient', () => {
  let redisClient;

  beforeAll(() => {
    redisClient = require('./redis').redisClient;
  });

  test('should confirm client is alive', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  test('should set and get a key-value pair', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  test('should delete a key', async () => {
    await redisClient.set('deleteKey', 'deleteValue', 10);
    await redisClient.del('deleteKey');
    const value = await redisClient.get('deleteKey');
    expect(value).toBeNull();
  });
});

// Tests for DBClient

describe('DBClient', () => {
  let dbClient;

  beforeAll(() => {
    dbClient = require('./db').default;
  });

  test('should confirm client is connected to the database', async () => {
    const isConnected = await dbClient.isAlive();
    expect(isConnected).toBe(true);
  });

  test('should add, retrieve, and count a user', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const newUser = await dbClient.addUser(email, password);
    expect(newUser.email).toBe(email);

    const user = await dbClient.getUser(newUser._id.toString());
    expect(user.email).toBe(email);

    const userCount = await dbClient.nbUsers();
    expect(userCount).toBeGreaterThan(0);
  });

  test('should add, retrieve, and count a file', async () => {
    const parentId = 'someParentId';
    const newFile = await dbClient.getFile(parentId); // Assuming getFile actually adds a file for testing
    expect(newFile.parentId).toBe(parentId);

    const fileCount = await dbClient.nbFiles();
    expect(fileCount).toBeGreaterThan(0);
  });
});