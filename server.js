const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "your_secret_key"; // Change this to a secure key

// Use an in-memory queue to store user credentials
let usersQueue = [];

// Signup API
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (usersQueue.find((user) => user.username === username)) {
    return res.status(400).json({ success: false, message: "Username already exists!" });
  }

  // Push user to the queue
  usersQueue.push({ username, password });
  
  res.json({ success: true, message: "Signup successful!" });
});

// Login API (Returns JWT Token)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = usersQueue.find((user) => user.username === username && user.password === password);

  if (user) {
    // Generate a JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, message: "Login successful!", token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials!" });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
