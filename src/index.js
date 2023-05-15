require('dotenv').config();
const createServer = require('./server');

const port = process.env.PORT || 3000; // Server port

async function initServer() {
    const app = await createServer();

    app.listen(port, function(){
        console.log(`Server started in http://localhost:${port}`);
    });
}

initServer();
