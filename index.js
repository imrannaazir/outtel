// import 
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')("sk_test_51L3iK7LV5ePzXyiLRAdfym8o43gTES75OYg3mEbjksNIlysOC5vr15pKAe5t9mEFG7iQn76mnUoJRDG9St7tcVHN00INNZb8YM")


// middle ware
app.use(cors());
app.use(express.json());

// declare uri


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.aoiar.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);
//jwt token function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

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
        const orderCollection = client.db("outtel").collection("orders")
        const feedbackCollection = client.db("outtel").collection("feedbacks")
        const paymentCollection = client.db("outtel").collection("payments")

        //get all parts api
        app.get('/parts', async (req, res) => {
            const query = {};
            const parts = await (await partCollection.find(query).toArray()).reverse();
            res.send(parts);
        });
        //get all processors api
        app.get('/processors', async (req, res) => {
            const query = { category: "processors" }
            const processors = await partCollection.find(query).toArray()
            console.log(processors);
            res.send(processors)
        });
        //get all processors api
        app.get('/graphics_cards', async (req, res) => {
            const query = { category: "graphics cards" }
            const processors = await partCollection.find(query).toArray()
            console.log(processors);
            res.send(processors)
        });
        //get all services api
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await (await userCollection.find(query).toArray());
            res.send(users);
        });
        //get all reviews api
        app.get('/reviews', async (req, res) => {
            const query = {};
            const reviews = await feedbackCollection.find(query).toArray();
            res.send(reviews);
        });
        app.get('/reviews/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const reviews = await feedbackCollection.find(query).toArray();
            res.send(reviews);
        });

        // get all orders
        app.get('/orders', async (req, res) => {
            const query = {};
            const orders = await (await (await orderCollection.find(query).toArray()).reverse());
            res.send(orders);
        });

        // get a orders by id
        /*  app.get('/orders/:id', async (req, res) => {
             const id = req.params.id
             const query = { email: email };
             const reviews = await feedbackCollection.find(query).toArray();
             res.send(reviews);
         }); */

        //get a services api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const users = await userCollection.findOne(query);
            res.send(users);
        });
        // check admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin'
            res.send({ isAdmin })
        })
        //get a order for a user api
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const orders = await ((await orderCollection.find(query).toArray()).reverse());
            res.send(orders);
        });
        //get user image
        app.get('/user-image/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await ((await userCollection.findOne(query)));
            res.send({ image: result?.photoURL });
        });
        //get a services api
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const part = await (partCollection.find(query).toArray());
            res.send(part);
        });

        //post api for parts
        app.post('/parts', async (req, res) => {
            const newParts = req.body;
            const result = await partCollection.insertOne(newParts);
            res.send(result);
        });
        //post api for newOrder
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        });
        //post api for feedbacks
        app.post('/feedbacks', async (req, res) => {
            const newFeedback = req.body;
            const result = await feedbackCollection.insertOne(newFeedback);
            res.send(result);
        });

        //put user api
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const updatedUser = {
                $set: query
            }
            const option = { upsert: true }
            const result = await userCollection.updateOne(query, updatedUser, option)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            res.send(result);
        })

        //put admin api
        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
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
            const updatedUser = req.body;
            console.log(updatedUser);
            const query = { email: email }
            const updatedDoc = {
                $set: updatedUser
            }
            const result = await userCollection.updateOne(query, updatedDoc)
            console.log(result);
            res.send(result);


        })
        //put user api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: { status: "delivered" },
            }
            const result = await orderCollection.updateOne(query, updatedDoc)
            res.send(result);
        })

        //delete a part api
        app.delete('/parts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await partCollection.deleteOne(query)
            res.send(result)
        })
        //delete a unpaid order api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })





        //================================Payment API

        app.get('/get-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })
        //-----------------------------------------PAYMENT

        app.post("/create-payment-intent", async (req, res) => {
            const order = req.body;
            const price = order.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"],
            });

            res.send({ clientSecret: paymentIntent.client_secret });
        });

        // payment patch

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }

            const result = await paymentCollection.insertOne(payment);
            const updatedBooking = await orderCollection.updateOne(filter, updatedDoc);

            res.send(updatedBooking);
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

