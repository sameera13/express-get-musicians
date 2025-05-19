// install dependencies
const { execSync } = require('child_process');
execSync('npm install');
execSync('npm run seed');

const request = require("supertest")
const { db } = require('./db/connection');
const { Musician } = require('./models/index')
const app = require('./src/app');
const {seedMusician} = require("./seedData");

describe('/musicians endpoint', () => {
    // Reset DB and seed data before tests run
    beforeAll(async () => {
      await db.sync({ force: true });
      await Musician.bulkCreate(seedMusician);
    });
  
    afterAll(async () => {
      await db.close();
    });
  
    test("GET /musicians returns status 200", async () => {
      const response = await request(app).get("/musicians");
      expect(response.statusCode).toBe(200);
    });
  
    test("GET /musicians returns an array of musicians with correct fields", async () => {
      const response = await request(app).get("/musicians");
      const musicians = response.body;
  
      expect(Array.isArray(musicians)).toBe(true);
      expect(musicians.length).toBe(3);
      musicians.forEach((musician) => {
        expect(musician).toHaveProperty("name");
        expect(musician).toHaveProperty("instrument");
      });
    });
  
    test("GET /musicians includes specific musician (e.g. 'Jimi Hendrix')", async () => {
      const response = await request(app).get("/musicians");
      const names = response.body.map(m => m.name);
      expect(names).toContain("Jimi Hendrix");
    });
  });
  