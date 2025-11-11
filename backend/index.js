require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const { connectDB, getDB } = require('./db');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Backend!" });
});

// User registration route
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert user into database
    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    res.status(201).json({ 
      message: "User created successfully", 
      userId: result.insertedId 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const db = getDB();
    const usersCollection = db.collection('users');
    
    // Find user in database
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Successful login
    res.json({ 
      message: "Login successful", 
      username: user.username 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users (for testing purposes only - remove in production)
app.get("/api/users", async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    // Don't return passwords
    const usersWithoutPasswords = users.map(user => {
      return { username: user.username, createdAt: user.createdAt };
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});