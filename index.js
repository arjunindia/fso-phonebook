const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

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

const URL = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);
mongoose.connect(URL);

const personsSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^(\d{2}|\d{3})-\d*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

personsSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Persons = mongoose.model("Persons", personsSchema);
app.get("/info", async (_, res) => {
  res.send(`
    Phonebook has info for ${await Persons.estimatedDocumentCount()} people
    <br/>
    ${new Date().toString()}
    `);
});

app.get("/api/persons", (_, res) => {
  Persons.find().then((persons) => {
    res.json(persons);
  });
});

app.post("/api/persons", async (req, res, next) => {
  let body = req.body;
  if (!body || !body.name || !body.number)
    return res.status(400).json({ error: "Invalid body" });
  let p = await Persons.find({ name: body.name });
  if (p.length > 1) {
    console.log(p);
    return res.status(400).json({ error: "Name must be unique" });
  }
  const newContact = new Persons({
    name: body.name,
    number: body.number,
  });
  newContact
    .save()
    .then((newContact) => {
      res.json(newContact);
    })
    .catch((e) => next(e));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Persons.findById(id)
    .then((person) => {
      if (person) res.json(person);
      else
        res.status(404).json({
          error: "Record not found",
        });
    })
    .catch((e) => next(e));
});

app.put("/api/persons/:id", (req, res, next) => {
  let body = req.body;
  if (!body || !body.name || !body.number)
    return res.status(400).json({ error: "Invalid body" });
  Persons.findByIdAndUpdate(
    req.params.id,
    { number: body.number },
    { new: true, runValidators: true },
  )
    .then((person) => {
      res.json(person);
    })
    .catch((e) => next(e));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Persons.findByIdAndDelete(id)
    .then((person) => {
      if (!person)
        return res.status(404).json({
          error: "Not found!",
        });
      res.json(person);
    })
    .catch((e) => next(e));
});

// Handle non declared routes
const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

//Error handler middleware
const errorHandler = (error, _req, res, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
