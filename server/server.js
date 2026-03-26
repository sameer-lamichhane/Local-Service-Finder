require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Attach io to app so controllers can access it
app.set('io', io);

io.on('connection', (socket) => {
  // Each user joins a room by their userId
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {});
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => res.json({ success: true, message: 'Server is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

module.exports = app;
