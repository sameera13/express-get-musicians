const express = require("express");
const app = express();
const { Musician } = require("../models/index")
const { db } = require("../db/connection")

const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//TODO: Create a GET /musicians route to return all musicians 
//part 1
app.get("/musicians", async (req, res) => {
    try {
        const musicians = await Musician.findAll();
        res.json(musicians);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//part 2
app.get("/musicians/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const musician = await Musician.findByPk(id);
        if (musician) {
            res.json(musician);
        } else {
            res.status(404).json({ error: "Musician not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//part3
// POST
app.post("/musicians", async (req, res) => {
    try {
        const musician = await Musician.create(req.body);
        res.status(201).json(musician); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Update musician by ID
app.put("/musicians/:id", async (req, res) => {
    try {
        const musician = await Musician.findByPk(req.params.id);
        if (musician) {
            await musician.update(req.body);
            res.json(musician);
        } else {
            res.status(404).json({ error: "Musician not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Remove musician by ID
app.delete("/musicians/:id", async (req, res) => {
    try {
        const musician = await Musician.findByPk(req.params.id);
        if (musician) {
            await musician.destroy();
            res.json({ message: "Musician deleted" });
        } else {
            res.status(404).json({ error: "Musician not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = app;