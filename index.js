const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');

const connectionString = 'mongodb+srv://wanpatty168:b5G60goT92S5BkRT@cluster0.g4upfx3.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cluster0';
const collectionName = 'payments';

let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(connectionString);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

app.use(express.json());

app.get('/payments', async (req, res) => {
  try {
    const payments = await db.collection(collectionName).find().toArray();
    res.json(payments);
  } catch (error) {
    console.error('Error retrieving payments:', error);
    res.sendStatus(500);
  }
});

app.get('/payments/:id', async (req, res) => {
  const paymentId = req.params.id;
  try {
    const payment = await db.collection(collectionName).findOne({
      _id: ObjectId(paymentId),
    });
    if (payment) {
      res.json(payment);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error retrieving payment:', error);
    res.sendStatus(500);
  }
});

app.post('/payments', async (req, res) => {
  const { orderId, amount, currency } = req.body;
  try {
    const result = await db.collection(collectionName).insertOne({
      orderId,
      amount,
      currency,
      status: 'Pending',
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.sendStatus(500);
  }
});

app.put('/payments/:id', async (req, res) => {
  const paymentId = req.params.id;
  const { status } = req.body;
  try {
    const result = await db.collection(collectionName).updateOne(
      { _id: ObjectId(paymentId) },
      { $set: { status } }
    );
    if (result.modifiedCount > 0) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    res.sendStatus(500);
  }
});

connectToDatabase().then(() => {
  app.listen(3000, () => {
    console.log('Payment service is running on port 3000');
  });
});

