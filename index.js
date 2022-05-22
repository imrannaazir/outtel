// import 
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

// middle ware
app.use(cors());
app.use(express.json());

// declare uri


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.aoiar.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//run function
async function run() {
    try {
        await client.connect();
        // create collections
        const userCollection = client.db("outtel").collection("users")
        //put user api

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email: email }
            const updatedUser = {
                $set: query
            }
            const option = { upsert: true }
            const result = await userCollection.updateOne(query, updatedUser, option)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token });
        })
    }

    finally {

    }
}
//call the function
run().catch(console.dir())

// root get api
app.get('/', (req, res) => {
    res.send("I am from backend✅✅✅")
})

// port
app.listen(port, () => {
    console.log("Running like horse🐎🐎");
})

