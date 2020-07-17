const mongoose = require("mongoose");

/*
if (process.argv.length < 5 && process.argv.length !== 3) {
  console.log(
    "Please provide password, name and phone number: node mongo.js <password> <name> <phone-number> "
  );
  process.exit(1);
}
*/

const databaseName = "phonebook";
const password = process.argv[2];
const personName = process.argv[3];
const personNumber = process.argv[4];
const databaseUrl = `mongodb+srv://fullstack_1:${password}@cluster0.sg5za.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

// connect database
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// create database schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// create Person function
const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  console.log("phonebook:");
  Person.find({}).then((persons) => {
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });

    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: personName,
    number: personNumber,
  });

  // save person to database
  person.save().then((result) => {
    console.log(`added ${result.name} ${result.number} to phone book`);

    mongoose.connection.close();
  });
}
