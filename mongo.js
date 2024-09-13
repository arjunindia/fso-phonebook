const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const name = process.argv[3];
const phone = process.argv[4];

const url = `mongodb+srv://phonebookadmin:${password}@cluster0.r0cas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personsSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Persons = mongoose.model("Persons", personsSchema);

if (!name || !phone) {
  Persons.find().then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Persons({
    name,
    number: String(phone),
  });

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
