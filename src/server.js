const express = require('express');
const route = require('./api/route');
const db = require('./db');
const storage = require('./storage');

const createServer = async () => {
    await db.init(); // initialize database ex. create tables
    await storage.init(); // initialize storage ex. folder or cloud bucket
    
    const app = express();

    app.use(express.json({
        limit: '50mb',
        extended: true
    }));
    
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true
    }));
    
    app.use('/', route); // all the routes

    return app;
}

module.exports = createServer