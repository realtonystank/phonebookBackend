require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/personModel");

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    const tiny = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ];
    if (req.method === "POST") {
      return [...tiny, tokens.body(req, res)].join(" ");
    }
    return [...tiny].join(" ");
  })
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => next(err));
});
app.get("/api/info", (req, res) => {
  Person.find({}).then((result) => {
    res.send(`<p>Database has <strong>${result.length}</strong> records. </p>`);
  });
});

app.post("/api/persons/", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });

  person
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const updatedPerson = {
    name: req.body.name,
    number: req.body.number,
  };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((result) => res.json(result))
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "already deleted" });
      }
    })
    .catch((err) => {
      next(err);
    });
});

const unknownRouteHandler = (req, res) => {
  res.status(404).json({ error: "invalid route" });
};

app.use(unknownRouteHandler);

const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on PORT:${PORT}`));
