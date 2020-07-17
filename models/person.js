const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
const url = process.env.MONGODB_URI;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("successfully connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minlength: 3,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (s) {
        return s.match(/\d/g).length >= 8;
      },
      message: (props) => `${props.value} is less than 8 digits`,
    },
  },
}).set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

personSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Person", personSchema);
