const http = require('http');
const fs = require('fs');

const hostname = 'localhost';
const port = 8000;
const appUrl = 'http://localhost:3000';

let precipitation;
let temperature;

fs.readFile('./server/data/precipitation.json', (err, data) => {
    if (err) throw err;
    precipitation = data;
    // console.log(data);
});

fs.readFile('./server/data/temperature.json', (err, data) => {
    if (err) throw err;
    temperature = data;
    // console.log(data);
});

const requestListener = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', appUrl);
    res.setHeader('Content-Type', 'application/json');

    switch (req.url) {
        case '/precipitation':
            res.writeHead(200);
            res.end(precipitation);
            break;
        case '/temperature':
            res.writeHead(200);
            res.end(temperature);
            break;
        default:
            res.writeHead(404);
            res.end(JSON.stringify({error: 'Resource not found'}));
    }
};

const server = http.createServer(requestListener);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
