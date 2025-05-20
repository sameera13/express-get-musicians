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
    let createdMusicianId; 
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

    test("Returns a single musician by ID", async () => {
        const response = await request(app).get("/musicians/1");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("instrument");
      });
    
      test("Returns 404 if musician not found", async () => {
        const response = await request(app).get("/musicians/9999");
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: "Musician not found" });
      });

      // POST 
      test("POST /musicians creates a new musician", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "Freddie Mercury", instrument: "Vocals" });
    
        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe("Freddie Mercury"); 
        createdMusicianId = response.body.id;
      });

  // PUT
  test("PUT /musicians/:id updates a musician", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "Freddie M.", instrument: "Piano" });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Freddie M.");
  });

  // DELETE 
  test("DELETE /musicians/:id deletes a musician", async () => {
    const response = await request(app).delete(`/musicians/${createdMusicianId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Musician deleted");
  });

  // Confirm deletion
  test("GET /musicians/:id returns 404 for deleted musician", async () => {
    const response = await request(app).get(`/musicians/${createdMusicianId}`);
    expect(response.statusCode).toBe(404);
  });
  });
  