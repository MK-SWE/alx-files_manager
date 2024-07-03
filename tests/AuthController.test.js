// Import necessary libraries and tools
import { use, expect as _expect, request } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app'; // Assuming the Express app is exported from app.js

// Configure chai
use(chaiHttp);
const expect = _expect;

// Define a suite of tests for each endpoint
describe('API Endpoints', () => {
  // Test GET /connect endpoint
  it('GET /connect should establish a connection', (done) => {
    request(app)
      .get('/connect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add specific expectations for the connection response
        done();
      });
  });

  // Test GET /disconnect endpoint
  it('GET /disconnect should terminate a connection', (done) => {
    request(app)
      .get('/disconnect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add specific expectations for the disconnection response
        done();
      });
  });

  // Test GET /users/me endpoint
  it('GET /users/me should return the current user\'s information', (done) => {
    request(app)
      .get('/users/me')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add specific expectations for the user information returned
        done();
      });
  });
});