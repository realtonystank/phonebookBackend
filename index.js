const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

const app = express();
let records = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const PORT = process.env.PORT || 3001;

app.use(cors());
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
  res.json(records);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const matchedRecord = records.find((record) => record.id === id);
  if (matchedRecord) {
    return res.json(matchedRecord);
  } else {
    res.status(404).end();
  }
});
app.get("/api/info", (req, res) => {
  res.send(
    `
      <p>Phonebook has info for ${records.length} people</p>
      <p>${new Date().toUTCString()}</p>
  `
  );
});

app.post("/api/persons/", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number missing" });
  }
  const matchingName = records.find((record) => record.name === body.name)
    ? true
    : false;
  if (matchingName) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const id = Math.floor(Math.random() * 1000000);
  const person = {
    id,
    name: req.body.name,
    number: req.body.number,
  };
  records = records.concat(person);
  res.status(201).json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  records = records.filter((record) => record.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Server running on PORT:${PORT}`));
