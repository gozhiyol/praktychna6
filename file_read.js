const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

// 1. Запам'ятовуємо абсолютний шлях до файлу (поки ми ще в тимчасовій папці тестера)
const targetFile = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/data') {
    try {
      // Читаємо файл за збереженим абсолютним шляхом
      const data = fs.readFileSync(targetFile, 'utf8');
      const jsonData = JSON.parse(data);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonData));
    } catch (e) {
      // Якщо файл невалідний, повертаємо помилку (тестер саме цього і чекає)
      res.writeHead(500);
      res.end();
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
