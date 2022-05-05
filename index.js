const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzzkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const stockCollection = client.db(`virtualWarehouse`).collection('stock');

        app.get('/stock', async (req, res) => {
            const query = {};
            const cursor = stockCollection.find(query);
            const stocks = await cursor.toArray();
            res.send(stocks);
        });
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('the virtual warehouse is manufacturing')
});

app.listen(port, () => {
    console.log('hearing to port', port)
})