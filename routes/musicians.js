const express = require("express");
const router = express.Router();
const {Musician} = require("../models");
//GET
router.get("/", async (req, res) => {
    const musicians = await Musician.findAll();
    res.json(musicians);
});

//GET by id
router.get("/id", async(req, res) =>{
    const musician = await Musician.findByPk(req.params.id);
    if(musician){
        res.json(musician);
    }
    else{
        res.status(404).json({ error: "Musician not found"});
    }
});
//POST
router.post("/", async (req, res) =>{
    try{
        const newMusician = await Musician.create(req.body);
        res.status(201).json(newMusician);
    }
    catch(error){
        res.status(400).json({error: "Failed to create musician"});
    }
});

// PUT 
router.put("/:id", async (req, res) => {
  const musician = await Musician.findByPk(req.params.id);
  if (musician) {
    await musician.update(req.body);
    res.json(musician);
  } else {
    res.status(404).json({ error: "Musician not found" });
  }
});

// DELETE 
router.delete("/:id", async (req, res) => {
  const musician = await Musician.findByPk(req.params.id);
  if (musician) {
    await musician.destroy();
    res.json({ message: "Musician deleted" });
  } else {
    res.status(404).json({ error: "Musician not found" });
  }
});

module.exports = router;
