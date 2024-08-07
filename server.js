const express = require('express');
const amqp = require('amqplib');
const app = express();
const port = 9000;

app.use(express.json());
let data = [];
let connection;
let channel;

app.get('/data', (req, res) => {
    res.json(data);
});

app.post('/data', async (req, res) => {
    const newData = req.body;
    data.push(newData);
    console.log(newData);
    try {
        await sendQue(newData);
        res.status(201).json(newData);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengirim data ke antrian' });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    ConnectionRabbit();
});

const ConnectionRabbit = async () => {
    try {
        // const conString = `amqp://guest:guest@localhost`;
        const conString = `amqp://guest:guest@192.168.60.26`;
        connection = await amqp.connect(conString);
        channel = await connection.createChannel();
        await channel.assertQueue('send-queue');
    } catch (error) {
        console.log('Error connecting to RabbitMQ:', error.message);
    }
};

const sendQue = async (data) => {
    try {
        if (!channel) {
            throw new Error('Channel belum terhubung');
        }
        await channel.sendToQueue(
            'send-queue',
            Buffer.from(JSON.stringify(data))
        );
    } catch (error) {
        console.log('Error sending to queue:', error.message);
    }
};

