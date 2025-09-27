const http = require('http');
const routing = require('./routing')
const port = 3000;

const server = new http.createServer((req, res) => {
    var jsonString = '';
    
    req.on('data', (data)=> {
        jsonString += data;
    });

    req.on('end', () => {
        routing.define(req, res, jsonString); 
    });
});


server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});