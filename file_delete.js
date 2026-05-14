const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

// Фіксуємо шлях до data.json (поки ми ще в тимчасовій папці тестера)
const targetFile = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  // Перевіряємо, чи це запит DELETE і чи шлях починається з /data/
  if (req.method === 'DELETE' && req.url.startsWith('/data/')) {
    const targetId = req.url.split('/')[2];

    // Перевірка 1: Чи існує файл data.json? (якщо ні - 500)
    if (!fs.existsSync(targetFile)) {
      res.writeHead(500);
      return res.end();
    }

    let fileContent;
    try {
      fileContent = fs.readFileSync(targetFile, 'utf8');
    } catch (e) {
      res.writeHead(500);
      return res.end();
    }

    let items;
    // Перевірка 2: Чи валідний JSON у файлі? (якщо ні - 400)
    try {
      items = JSON.parse(fileContent);
    } catch (e) {
      res.writeHead(400);
      return res.end();
    }

    // Перевірка 3: Шукаємо об'єкт із вказаним id
    // Використовуємо String() для безпечного порівняння
    const itemIndex = items.findIndex(item => String(item.id) === targetId);

    if (itemIndex === -1) {
      // Якщо об'єкт не знайдено - статус 404
      res.writeHead(404);
      return res.end();
    }

    // Видаляємо елемент з масиву
    items.splice(itemIndex, 1);

    // Записуємо оновлений масив назад у файл
    try {
      fs.writeFileSync(targetFile, JSON.stringify(items));
      // Успішне видалення - статус 200
      res.writeHead(200);
      res.end();
    } catch (e) {
      res.writeHead(500);
      res.end();
    }
    
  } else {
    // Якщо прийшов запит на інший шлях або з іншим методом
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
