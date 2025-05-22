const express = require("express");
const router = express.Router();
const {Musician} = require("../models");
const { check, validationResult } = require("express-validator");

//GET
router.get("/", async (req, res) => {
    const musicians = await Musician.findAll();
    res.json(musicians);
});

//GET by id - FIXED: was missing /:id
router.get("/:id", async(req, res) =>{
    const musician = await Musician.findByPk(req.params.id);
    if(musician){
        res.json(musician);
    }
    else{
        res.status(404).json({ error: "Musician not found"});
    }
});

//POST with validation
router.post("/", 
    [
        check('name')
            .trim()
            .notEmpty()
            .withMessage('Name field cannot be empty')
            .isLength({ min: 2, max: 20 })
            .withMessage('Name must be between 2 and 20 characters'),
        check('instrument')
            .trim()
            .notEmpty()
            .withMessage('Instrument field cannot be empty')
            .isLength({ min: 2, max: 20 })
            .withMessage('Instrument must be between 2 and 20 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        
        try{
            const newMusician = await Musician.create(req.body);
            res.status(201).json(newMusician);
        }
        catch(error){
            res.status(400).json({error: "Failed to create musician"});
        }
    }
);

// PUT with validation
router.put("/:id", 
    [
        check('name')
            .trim()
            .notEmpty()
            .withMessage('Name field cannot be empty')
            .isLength({ min: 2, max: 20 })
            .withMessage('Name must be between 2 and 20 characters'),
        check('instrument')
            .trim()
            .notEmpty()
            .withMessage('Instrument field cannot be empty')
            .isLength({ min: 2, max: 20 })
            .withMessage('Instrument must be between 2 and 20 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        
        const musician = await Musician.findByPk(req.params.id);
        if (musician) {
            await musician.update(req.body);
            res.json(musician);
        } else {
            res.status(404).json({ error: "Musician not found" });
        }
    }
);

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