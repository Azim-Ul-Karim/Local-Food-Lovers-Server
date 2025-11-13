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
            const cursor = reviewsCollection.find().sort({ dateAdded: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/featured-reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ rating: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`LFLN is using port ${port}!`);
})