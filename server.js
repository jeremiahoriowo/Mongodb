const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const client = new MongoClient(process.env.MONGODB_URL);

app.use(express.json());
app.use(express.static("public")); // serve static files like index.html, update.html, delete.html

async function startServer() {
  await client.connect();
  console.log("Connected to MongoDB");
  const db = client.db("School");
  const users = db.collection("Users");

  // (Optional) keep your existing aggregation if needed
  // const result = await users.aggregate([{ $match: { age: 0 } }]);
  // console.log(await result.toArray());

  // ----- REGISTER (POST) -----
  app.post("/register", async (request, response) => {
    const { email, password, username } = request.body;
    // Check if user already exists?
    const existing = await users.findOne({ email });
    if (existing) {
      return response.status(400).json({ success: false, message: "Email already registered" });
    }
    await users.insertOne({ username, email, password });
    response.json({ success: true, message: "Registration successful" });
  });

  // ----- UPDATE (PUT) -----
  app.put("/update", async (request, response) => {
    const { currentEmail, newUsername, newEmail, newPassword } = request.body;

    // Build update object – only include fields that are provided
    const updateFields = {};
    if (newUsername) updateFields.username = newUsername;
    if (newEmail) updateFields.email = newEmail;
    if (newPassword) updateFields.password = newPassword;

    if (Object.keys(updateFields).length === 0) {
      return response.status(400).json({ success: false, message: "No fields to update" });
    }

    const result = await users.updateOne(
      { email: currentEmail },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    response.json({ success: true, message: "User updated successfully" });
  });

  // ----- DELETE (DELETE) -----
  app.delete("/delete", async (request, response) => {
    const { email } = request.body;
    const result = await users.deleteOne({ email });

    if (result.deletedCount === 0) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    response.json({ success: true, message: "User deleted successfully" });
  });

  // ----- LOGIN (POST) -----
  app.post("/login", async (request, response) => {
    const { email, password } = request.body;
    const user = await users.findOne({ email, password });

    if (!user) {
      return response.status(401).json({ success: false, message: "Invalid email or password" });
    }

    response.json({ success: true, message: "Login successful", user: { username: user.username, email: user.email } });
  });

  // ----- GET USER (GET) -----
  app.get("/getUser/:email", async (request, response) => {
    const { email } = request.params;
    const user = await users.findOne({ email });

    if (!user) {
      return response.status(404).json({ success: false, message: "User not found" });
    }

    response.json({ success: true, user: { username: user.username, email: user.email, password: user.password } });
  });

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer().catch(console.error);