const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

const client = new MongoClient(process.env.MONGODB_URL);
app.use(express.json());
app.use(express.static("public"));

async function startServer() {
  await client.connect();
  console.log("Connected to MongoDB");
  const db = client.db("School");

  const users = db.collection("Users");

  console.log("User inserted into the database");

  app.post("/register", async (request, response) => {
    const { email, password, username } = request.body;
    const user = await users.insertOne({
        username: username,
        email: email,
        password: password,
      });

    response.json({
      success: true,
      message: "Registration successful",
    });
  });
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer().catch(console.error);
