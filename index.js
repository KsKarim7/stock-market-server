const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');

// middleware here
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('auth', authHeader, req.headers)
    if (!authHeader) {
        console.log(authHeader)
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('deco', decoded);
        req.decoded = decoded;
        next();
    })
    // console.log('verifyJWT', authHeader);

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mzzkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const stockCollection = client.db(`virtualWarehouse`).collection('stock');

        // auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log(user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

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

        app.get('/singlestock', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            // const authHeader = req.headers.authorization;
            // console.log(authHeader)
            console.log('decoded email', decodedEmail)
            const email = req.query.email;
            // console.log('email', email)

            // console.log(email)
            if (email === decodedEmail) {
                console.log('hit')
                const query = { email: email };
                const cursor = stockCollection.find(query);
                const stocks = await cursor.toArray();
                // console.log(stocks)
                res.send(stocks)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }

        })

        // delete stock from inventory
        app.delete('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await stockCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/singlestock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await stockCollection.deleteOne(query);
            res.send(result);
        })

        //update stock quantity
        app.put('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            console.log(updateQuantity)
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

        // Add Stocks
        app.post('/stock', async (req, res) => {
            const addStock = req.body;
            const result = await stockCollection.insertOne(addStock);
            res.send(result);

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