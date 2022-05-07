const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzzkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const stockCollection = client.db(`virtualWarehouse`).collection('stock');

        //get all stocks
        app.get('/stock', async (req, res) => {
            const query = {};
            const cursor = stockCollection.find(query);
            const stocks = await cursor.toArray();
            res.send(stocks);
        });

        //get single stock
        app.get('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const stock = await stockCollection.findOne(query);
            res.send(stock)
        })

        // delete stock from inventory
        app.delete('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await stockCollection.deleteOne(query);
            res.send(result);
        })

        //update stock quantity
        app.put('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateQuantity.quantity
                }
            };
            const result = await stockCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

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