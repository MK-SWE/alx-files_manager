// Import necessary libraries and tools
import { use, expect as _expect, request } from 'chai';
import chaiHttp from 'chai-http';
import app from '../app'; // Assuming the Express app is exported from app.js

// Configure chai
use(chaiHttp);
const expect = _expect;

// Define a suite of tests for each endpoint
describe('API Endpoints', () => {
  // Test GET /status endpoint
  it('GET /status should return the status of the API', (done) => {
    request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ status: 'OK' }); // Assuming the expected response
        done();
      });
  });

  // Test GET /stats endpoint
  it('GET /stats should return statistics', (done) => {
    request(app)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add specific expectations for the stats returned
        done();
      });
  });
});