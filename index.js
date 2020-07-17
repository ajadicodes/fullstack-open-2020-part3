require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
morgan.token("body", (request) => JSON.stringify(request.body));

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.status(200).json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response
        .status(200)
        .send(
          `<div><div>Phonebook has info for ${count} people</div><div>${new Date()}</div></div>`
        );
    })
    .catch((error) => next(error));
});

// to display for a single phonebook entry
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      // cater for when person returns null i.e. when wrong id is requested
      if (!person) {
        return response.status(404).end();
      }
      response.status(200).send(person);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      // cater for when deletedPerson is null, i.e. the id does not previously exist
      if (!deletedPerson) {
        return response
          .status(410)
          .json({
            statusCode: 410,
            message: "Contact has been previously deleted.",
          });
      }
      response.status(200).send({ name: deletedPerson.name });
    })
    .catch((error) => next(error));
});

// add person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.status(200).json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  const personUpdate = {
    number: body.number,
  };

  Person.findByIdAndUpdate(id, personUpdate, { new: true, runValidators: true })
    .then((updatedPerson) => {
      // updatedContact is null if contact to be updated has
      // previously been deleted
      if (!updatedPerson) {
        return response
          .status(410)
          .json({
            statusCode: 410,
            message: "Cannot update a non-existent contact information.",
          });
      }
      response.status(200).json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "Unknown Endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).json({ message: "Wrong ID format." });
  }

  if (error.name === "ValidationError") {
    return response.status(500).json({ message: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
