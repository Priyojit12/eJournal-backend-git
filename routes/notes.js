const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Send error occured");
  }
});

router.post(
  "/postallnotes",
  fetchUser,
  [
    body("title", "enter a valid title").isLength(1),
    body("description", "Cannot be empty").isLength({ min: 1 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({ title, description, tag, user: req.user.id });
      const savedNotes = await note.save();
      res.json(savedNotes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Send error occured");
    }
  }
);

router.put("/updatenotes/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  const newNote = {};
  try {
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found ");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(404).send("not allowed ");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {}
});

router.delete("/deletenotes/:id", fetchUser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found ");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(404).send("not allowed ");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "note has been deleted", note: note });
  } catch (error) {}
});

module.exports = router;
