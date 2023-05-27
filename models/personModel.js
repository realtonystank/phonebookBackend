const mongoose = require("mongoose");

let url = process.env.MONGO_URI;
const password = process.env.DB_PASS;

url = url.replace("<password>", password);
console.log(`Connecting to database:${url}`);

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((result) => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, "name is required"],
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        return /^\d{2,3}-\d{6,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
    required: [true, "phone number is required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("PhoneRecord", personSchema);
