const express = require("express");
const fs = require("fs");
const UID = require("./public/assets/js/UID");

const app = express();
const PORT = process.env.PORT || 3001;
const path = require("path");

const notes = [];
const uid = new UID();

//const notes = require("./db/db.json");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(express.static("public"));

/*
 *  Reads in the notes saved in ./db/db.json into the list of notes we will use to read and write.
 */
function readNotes() {
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        let rawNotes = JSON.parse(data);
        for (const note of rawNotes) {
            note.id = uid.getNextID();
            notes.push(note);
        }
        console.log(notes);
    });
}

readNotes();

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) =>
    res.json(notes)
);

app.post('/api/notes', (req, res) => {
    const note = req.body;
    note.id = uid.getNextID();
    notes.push(note);
    console.log(notes);
    res.json(note);
});

app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
    console.log(`Note Taker app listening at http://localhost:${PORT}`)
);