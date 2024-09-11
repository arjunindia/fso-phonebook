import express from "express";
const app = express();

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

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const record = persons.filter((person) => person.id === id);
  if (record.length < 1)
    return res.status(404).json({
      error: "Missing content",
    });
  res.json(record[0]);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
