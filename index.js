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

//jwt token function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

//run function
async function run() {
    try {
        await client.connect();
        // create collections
        const userCollection = client.db("outtel").collection("users")
        const partCollection = client.db("outtel").collection("parts")

        //get all services api
        app.get('/parts', async (req, res) => {
            const query = {};
            const parts = await (await partCollection.find(query).toArray()).reverse();
            res.send(parts);
        });
        //get all services api
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await (await userCollection.find(query).toArray());
            res.send(users);
        });

        //post api for parts
        app.post('/parts', async (req, res) => {
            const newParts = req.body;
            const result = await partCollection.insertOne(newParts);
            res.send(result);
        });

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

        //put admin api
        app.put('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            console.log("email bro", email);
            const query = { email: email }
            const updatedDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(query, updatedDoc)
            res.send(result)

        })
        //put user api
        app.put('/update-users/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const updatedUser = req.body;
            const query = { email: email }
            const updatedDoc = {
                $set: updatedUser
            }
            const option = { upsert: true }
            const result = await userCollection.updateOne(query, updatedDoc, option)
            res.send(result);
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

