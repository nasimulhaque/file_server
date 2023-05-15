require('dotenv').config();
const express = require('express');
const route = require('./api/route');
const db = require('./db');
const storage = require('./storage');

const port = process.env.PORT || 3000; // Server port

const app = express();

// function to initialize database and storage
async function initServer() {
    await db.init(); // initialize database ex. create tables
    await storage.init(); // initialize storage ex. folder or cloud bucket
    
    app.use(express.json({
        limit: '50mb',
        extended: true
    }));
    
    app.use(express.urlencoded({
        limit: '50mb',
        extended: true
    }));
    
    app.use('/', route); // all the routes
    
    app.listen(port, function(){
        console.log(`Server started in http://localhost:${port}`);
    });
}

initServer();


