const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const path = require("path");

/* This list of notes in our application */
const notes = [];

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* index.html needs index.js and styles.css, so these need to be served up statically. */
app.use(express.static("public"));

/*
 *  Reads in the notes saved in ./db/db.json into the list of notes we will use to read and write.
 *  NOTE: I'm pushing each note into notes because I declared notes as constant earlier and I don't want to redefine it.
 *
 *  In order to read the notes we must:
 *      1. Parse the notes from the file we save it in.
 *      2. For each note that we parsed:
 *          a. Add it to our list of notes.
 */
function readNotes() {
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        /* 1. Parse the notes from the file we save it in. */
        let rawNotes = JSON.parse(data);
        /* 2. For each note that we parsed: */
        for (const note of rawNotes) {
            /* 2. a. Add it to our list of notes. */
            notes.push(note);
        }
    });
}

/*
 *  Removes the note with the id equal to the input parameter from our list of notes.
 *  Returns the deleted note.
 * 
 *  @param {number} id: An integer representing the id of the note to delete.
 *  @return {object}:   The note that we are removing.
 */
function removeNote(id) {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            return notes.splice(i, 1)[0];
        }
    }

    /* If we get to this point and didn't find the note, there's some serious problems. */
    throw new Error("Error: could not find note matching the input id");
}

/*
 *  Writes the list of notes saved in the variable notes to ./db/db.json.
 *  Because the test note in db.json didn't come with an ID, I'm going to try and hide the ID as much as possible as I try to avoid
 *  modifying the starter files too much. Thus, I won't save the IDs of the notes when writing to file and will only generate them when reading from
 *  db.json or on a post request. The user doesn't need to see the ID anyway.
 */
function writeNotes() {
    /* 
     * The second parameter is the replacer parameter. See: 
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
     */
    const toWrite = JSON.stringify(notes, null, "\t");
    fs.writeFile("./db/db.json", toWrite, "utf8", (err) => {
        if (err) {
            console.log(err);
        }
    });
}

/* At the start of the program we have to read our saved notes into the notes array in order to serve it up on request. */
readNotes();

/* When the user requests /notes, we direct them to notes.html. */
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

/* When /api/notes receives a GET request, we send them the list of notes. */
app.get('/api/notes', (req, res) =>
    res.json(notes)
);

/*  Defines the POST route to add a new note.
 *  
 *  When /api/notes receives a POST request, we must: 
 *      1. Parse out the title and text of the note.
 *      2. Create a new note with a unique id, and the title and text we parsed.
 *      3. Add it to our list of notes.
 *      4. Write the new list of notes to our file of saved notes. 
 *      5. Send the saved note back, as the front-end is expecting that.
 */
app.post('/api/notes', (req, res) => {

    /* 1. Parse out the title and text of the note. */
    const { title, text } = req.body;

    /* 2. Create a new note with a unique id, and the title and text we parsed. */
    const note = {
        id: uuidv4(),
        title: title,
        text: text
    };

    /* 3. Add it to our list of notes. */
    notes.push(note);

    /* 4. Write the new list of notes to our file of saved notes.  */
    writeNotes();

    /* 5. Send the saved note back, as the front-end is expecting that. */
    res.json(note);
});

/*
 *  Handles the DELETE route to delete a note when given the note ID.
 *  
 *  When /api/notes/:id recieves a DELETE request we must:
 *      1. Parse out the id from the request.
 *      2. Remove the note from our list of notes.
 *      3. Write the updated note list to disk.
 *      4. Send back the deleted note, as the front-end is expecting some sort of response.
 */
app.delete('/api/notes/:id', (req, res) => {
    /* 1. Parse out the id from the request. */
    const id = req.params.id;

    /* 2. Remove the note from our list of notes. */
    const note = removeNote(id);

    /* 3. Write the updated note list to disk. */
    writeNotes();

    /* 4. Send back the deleted note, as the front-end is expecting some sort of response. */
    res.json(note);
});

/* The default route. */
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/index.html'))
);

/* Listen for requests. */
app.listen(PORT, () =>
    console.log(`Note Taker app listening at http://localhost:${PORT}`)
);