const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.port || 5000;


const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.4ye73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("dream_tour");
        const offersCollection = database.collection("offers");
        const bookedCollection = database.collection("booked");

        app.post("/offers", async (req, res) => {
            const offerDetails = req.body;
            const result = await offersCollection.insertOne(offerDetails);
            res.json(result);
        });

        app.get('/offers', async (req, res) => {
            const result = await offersCollection.find({}).toArray();
            res.send(result)
        })


        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const find = { _id: ObjectId(id) }
            const result = await offersCollection.findOne(find);
            res.send(result)
        })

        app.post("/booked/:id", async (req, res) => {
            const id = req.params.id;
            const find = { _id: ObjectId(id) }
            const resultFound = await offersCollection.findOne(find);
            const body = req.body;
            body.Country = resultFound.Country;
            body.price = resultFound.price;
            body.location = resultFound.location;
            body.time = resultFound.time;
            body.img = resultFound.img;
            const result = await bookedCollection.insertOne(body);
            console.log(result);
            res.json(result);
        });


        app.get('/mybooking/:email', async (req, res) => {
            const email = req.params.email;
            const find = { user_email: { $regex: email } }
            const result = await bookedCollection.find(find).toArray();
            res.send(result)
        })

        app.get('/booked', async (req, res) => {
            const result = await bookedCollection.find({}).toArray();
            res.send(result)
        })

        app.delete('/booked/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookedCollection.deleteOne(query);
            res.json(result);
        })

        app.put("/booked/update/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await bookedCollection.updateOne(query, updateDoc, options);
            res.json(result);
            
        })

        app.delete('/mybooking/:email/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bookedCollection.deleteOne(query);
            res.json(result);
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running DreamTour Server!')
});

app.listen(port, () => {
    console.log('Example app listennning', port)
});