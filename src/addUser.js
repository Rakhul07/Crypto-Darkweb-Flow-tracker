
const fs = require("fs");
const bcrypt = require("bcrypt");

const usersFile = "users.json";

const addUser = async (username, plainPassword) => {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  let users = [];
  try {
    const data = fs.readFileSync(usersFile);
    users = JSON.parse(data);
  } catch (err) {
    console.error("Error reading users.json:", err);
  }

  users.push({ username, password: hashedPassword });

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log("User added successfully!");
};

addUser("testuser", "password123");
