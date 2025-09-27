const url = require('url');
const path = require('path');
const fs = require('fs')

const define = function(req, res, postData) {
  const urlParsed = url.parse(req.url, true);
  let pathName = urlParsed.pathname;
  console.log('Запрос:', pathName);

  const htmlpaths ={
    '/' : 'MainPage.html',
    '/login' : 'login.html',
    '/registration' : 'registration.html'
  }

  const getContentTypes = (filePath) => {
    const ext = path.extname(filePath);
    console.log('type',filePath);
    const types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.ico': 'image/x-icon',
            '.json': 'application/json'
        };
        return types[ext];
  }


  //обработка статики
  if (pathName.startsWith('/static/')) {
    const filePath =path.join(__dirname, 'public', pathName);
    console.log('statiks',filePath);

    fs.readFile(filePath, (err, data) => {
      if (err){
        console.log('статики нема', filePath);
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, {'Content-Type': getContentTypes(filePath)});
        res.end(data);
      }
    });
    return;
  }
  
  const htmlFilePath = htmlpaths[pathName] || 'MainPage.html';
  const htmlFile = path.join(__dirname, 'public', htmlFilePath);
  console.log('file', htmlFile);

  fs.readFile(htmlFile, 'utf-8', (err, html) => {
    if (err){
      const errorFile404 = path.join(__dirname, 'public', '404.html');
      fs.readFile(errorFile404, 'utf-8', (err, html) => {
        if (err){
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end('страница не найдена');
        } else {
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.end(html);
        }
      });
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(html);
    }
  });
};
exports.define = define;