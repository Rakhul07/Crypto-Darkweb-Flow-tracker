const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "user.json";
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

// Read user data
const readUserData = () => {
  if (!fs.existsSync(DATA_FILE)) return { users: [] }; // Handle missing file
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Write user data
const writeUserData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Signup API
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const users = readUserData().users;

  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ success: false, message: "Username already exists!" });
  }

  users.push({ username, password });
  writeUserData({ users });

  res.json({ success: true, message: "Signup successful!" });
});

// Login API (Returns JWT Token)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readUserData().users;

  const user = users.find((user) => user.username === username && user.password === password);

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
