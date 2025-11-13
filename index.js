const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nxdef89.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to Local Food Lovers Network!')
})

async function run() {
    try {
        await client.connect();

        const loversDB = client.db('Local_Food_Lovers_DB');
        const reviewsCollection = loversDB.collection('reviews');
        const usersCollection = loversDB.collection('users');
        const favoritesCollection = loversDB.collection('favorites');

        // Reviews Collection

        app.get('/reviews', async (req, res) => {
            try {
                const search = req.query.search;
                const query = {};

                if (search && search.trim() !== '') {
                    query.foodName = {
                        $regex: search.trim(),
                        $options: 'i'
                    };
                }

                const cursor = reviewsCollection.find(query).sort({ dateAdded: -1 });
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        })

        app.get('/featured-reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ rating: -1, dateAdded: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        })

        app.get('/my-reviews', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const cursor = reviewsCollection.find(query).sort({ dateAdded: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.patch('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const updatedReview = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedReview
            };
            const result = await reviewsCollection.updateOne(query, update);
            res.send(result);
        })

        app.delete('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })

        // Users Collection

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'Already registered.' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })

        // Favorites Collection

        app.get('/favorites', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email;
            }
            const cursor = favoritesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/favorites', async (req, res) => {
            const newFav = req.body;
            const query = { reviewId: newFav.reviewId, email: newFav.email };
            const existing = await favoritesCollection.findOne(query);
            if (existing) {
                return res.send({ message: 'Already added!' });
            }
            const result = await favoritesCollection.insertOne(newFav);
            res.send(result);
        });

        app.delete('/favorites/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoritesCollection.deleteOne(query);
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged the deployment. Successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`LFLN is using port ${port}!`);
})