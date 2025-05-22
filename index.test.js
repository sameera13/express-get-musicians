// install dependencies
const request = require("supertest");
const app = require("./src/app");

const { execSync } = require('child_process');
execSync('npm install');
execSync('npm run seed');

const { db } = require('./db/connection');
const { Musician } = require('./models/index')

const {seedMusician} = require("./seedData");
const { response } = require('express');

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

      // Validation Tests for POST
      test("POST /musicians returns errors if name is empty", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "", instrument: "Guitar" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "name" }),
          ])
        );
      });

      test("POST /musicians returns errors if instrument is empty", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "John Doe", instrument: "" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "instrument" }),
          ])
        );
      });

      test("POST /musicians returns errors if name is too short", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "A", instrument: "Guitar" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "name" }),
          ])
        );
      });

      test("POST /musicians returns errors if name is too long", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "This name is way too long to be valid", instrument: "Guitar" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "name" }),
          ])
        );
      });

      test("POST /musicians returns errors if instrument is too short", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "John Doe", instrument: "G" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "instrument" }),
          ])
        );
      });

      test("POST /musicians returns errors if instrument is too long", async () => {
        const response = await request(app)
          .post("/musicians")
          .send({ name: "John Doe", instrument: "This instrument name is way too long" });
    
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ path: "instrument" }),
          ])
        );
      });
  
  // PUT
  test("PUT /musicians/:id updates a musician", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "Freddie M.", instrument: "Piano" });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Freddie M.");
  });

  // Validation Tests for PUT
  test("PUT /musicians/:id returns errors if name is empty", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "", instrument: "Piano" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
      ])
    );
  });

  test("PUT /musicians/:id returns errors if instrument is empty", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "Freddie M.", instrument: "" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "instrument" }),
      ])
    );
  });

  test("PUT /musicians/:id returns errors if name length is invalid", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "A", instrument: "Piano" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
      ])
    );
  });

  test("PUT /musicians/:id returns errors if instrument length is invalid", async () => {
    const response = await request(app)
      .put(`/musicians/${createdMusicianId}`)
      .send({ name: "Freddie M.", instrument: "This instrument name is way too long" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "instrument" }),
      ])
    );
  });

  // DELETE 
  test("DELETE /musician/:id deletes a musician", async() =>{
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