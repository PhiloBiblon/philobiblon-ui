const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const proposeRoutes = require('./routes/proposeRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/propose', proposeRoutes);
app.use('/api/admin/auth', authRoutes);

// Default route for unknown endpoints
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
