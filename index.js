const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
morgan.token("body", function (req, _) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);
app.use(express.static("dist"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (_, res) => {
  res.send(`
    Phonebook has info for ${persons.length} people
    <br/>
    ${new Date().toString()}
    `);
});

app.get("/api/persons", (_, res) => {
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
  let body = req.body;
  if (!body || !body.name || !body.number)
    return res.status(400).json({ error: "Invalid body" });
  if (persons.findIndex((person) => person.name === body.name) !== -1) {
    return res.status(400).json({ error: "Name must be unique" });
  }
  const newContact = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 10000000),
  };
  persons.push(newContact);
  res.json(newContact);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const record = persons.filter((person) => person.id === id);
  if (record.length < 1)
    return res.status(404).json({
      error: "Record not found",
    });
  res.json(record[0]);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const index = persons.findIndex((person) => person.id === id);
  if (index === -1) return res.status(404).json({ error: "Record not found" });
  res.json(persons.splice(index, 1)[0]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
