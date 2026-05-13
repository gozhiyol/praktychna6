const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

// 1. Запам'ятовуємо шлях до data.json у поточній папці тестера
const targetFile = path.join(process.cwd(), 'data.json');

// 2. АНТИ-EPERM ТРЮК: Змінюємо робочу директорію, щоб розблокувати папку для Windows
process.chdir('C:\\');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    let body = '';

    // Збираємо дані з потоку
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        // Перевіряємо, чи це валідний JSON
        JSON.parse(body);
        
        // Якщо помилки не виникло, записуємо дані у файл (синхронно)
        fs.writeFileSync(targetFile, body);
        
        // Повертаємо статус 200 (ОК)
        res.writeHead(200);
        res.end();
      } catch (e) {
        // Якщо JSON невалідний (JSON.parse викине помилку)
        res.writeHead(400);
        res.end();
      }
    });
  } else {
    // Якщо прийшов інший запит
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);