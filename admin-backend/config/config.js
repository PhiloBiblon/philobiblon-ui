require('dotenv').config(); // Load .env variables if using dotenv

module.exports = {
    development: {
        username: process.env.DB_USERNAME || 'kar',
        password: process.env.DB_PASSWORD || '1111',
        database: process.env.DB_DATABASE || 'philocloneadmin',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
    test: {
        username: process.env.DB_USERNAME || 'kar',
        password: process.env.DB_PASSWORD || '1111',
        database: process.env.DB_DATABASE || 'philocloneadmin',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
    production: {
        username: process.env.DB_USERNAME || 'kar',
        password: process.env.DB_PASSWORD || '1111',
        database: process.env.DB_DATABASE || 'philocloneadmin',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
};