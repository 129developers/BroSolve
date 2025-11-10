require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// simple health endpoint
app.get('/', (req, res) => res.send('BroSolve API running'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');
    } else {
      // try spinning up an in-memory MongoDB for convenience in this environment
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Started in-memory MongoDB');
      } catch (err) {
        console.warn('mongodb-memory-server not available; attempting default localhost connection');
        const fallback = process.env.FALLBACK_MONGO || 'mongodb://127.0.0.1:27017/brosolve';
        await mongoose.connect(fallback, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to fallback MongoDB at', fallback);
      }
    }

    server.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
