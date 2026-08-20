const express = require('express');
const {MongoClient} = require('mongodb');
require('dotenv').config();

const app = express();

const client = new MongoClient(process.env.MONGODB_URL);
app.use(express.json());
app.use(express.static('public'));

async function startServer() {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db("School");

    const users = db.collection("Users");

    app.post("/login", async(req, res) => {
        const {email, password} = req.body;
        const user  = await users.findOne({
            email: email,
        })

        if (!user) {
            return res.json({message: "User not found"});
        }

        if (user.password !== password) {
            return res.json({message: "Incorrect password"});
        }
        
         res.json({
            success: true,
            message: "Login successful"
        });
    })
        app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

startServer().catch(console.error);

