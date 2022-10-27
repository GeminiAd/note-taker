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

/*
 *  Removes the note with the id equal to the input parameter from our list of notes.
 */
function removeNote(id) {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            //console.log("REMOVING NOTE AT INDEX " + i);
            return notes.splice(i, 1)[0];
        }
    }
}

/*
 *  Writes the list of notes saved in the variable notes to ./db/db.json.
 *  Because the test note in db.json didn't come with an ID, I'm going to try and hide the ID as much as possible as I try to avoid
 *  modifying the starter files too much. Thus, I won't save the IDs of the notes when writing to file and will only generate them when reading from
 *  db.json or on a post request. The user doesn't need to see the ID anyway.
 */
function writeNotes() {
    const toWrite = JSON.stringify(notes, ["title", "text"], "\t");
    console.log(toWrite);
    fs.writeFile("./db/db.json", toWrite, "utf8", (err) => {
        if (err) {
            console.log(err);
        }
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
    writeNotes();
    res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const note = removeNote(id);
    writeNotes();
    res.json(note);
});

app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
    console.log(`Note Taker app listening at http://localhost:${PORT}`)
);