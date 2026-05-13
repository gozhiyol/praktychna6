const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

// 1. Фіксуємо абсолютний шлях до файлу (поки ми в папці тестера)
const targetFile = path.join(process.cwd(), 'data.json');

// 2. АНТИ-EPERM ТРЮК: Тікаємо з тимчасової папки, щоб зняти блокування Windows
process.chdir('C:\\');

const server = http.createServer((req, res) => {
  // Перевіряємо, чи це PUT запит і чи починається шлях з /data/
  if (req.method === 'PUT' && req.url.startsWith('/data/')) {
    // Витягуємо ID з URL (наприклад, з /data/2 дістаємо "2")
    const targetId = req.url.split('/')[2];
    
    let body = '';

    // Збираємо тіло запиту
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let newData;
      
      // Перевірка 1: Чи валідне JSON тіло запиту? (якщо ні - 400)
      try {
        newData = JSON.parse(body);
      } catch (e) {
        res.writeHead(400);
        return res.end();
      }

      // Перевірка 2: Чи існує файл data.json? (якщо ні - 500)
      if (!fs.existsSync(targetFile)) {
        res.writeHead(500);
        return res.end();
      }

      // Читаємо та парсимо існуючий масив з файлу
      let items = [];
      try {
        const fileContent = fs.readFileSync(targetFile, 'utf8');
        items = JSON.parse(fileContent);
      } catch (e) {
        res.writeHead(500);
        return res.end();
      }

      // Перевірка 3: Чи існує об'єкт з таким ID? (якщо ні - 404)
      // Використовуємо String(), бо в URL id це рядок, а в JSON може бути числом
      const itemIndex = items.findIndex(item => String(item.id) === targetId);

      if (itemIndex === -1) {
        res.writeHead(404);
        return res.end();
      }

      // Успіх: Оновлюємо властивості знайденого об'єкта
      items[itemIndex] = { ...items[itemIndex], ...newData };

      // Записуємо оновлений масив назад у файл
      try {
        fs.writeFileSync(targetFile, JSON.stringify(items));
        res.writeHead(200);
        res.end();
      } catch (e) {
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    // Якщо прийшов запит на інший шлях
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);