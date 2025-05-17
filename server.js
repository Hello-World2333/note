const express = require('express');
const fs = require('fs');
const app = express();
const port = 11451;

app.get('/', (req, res) => {
    fs.readFile('index.html', 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.send(data);
        }
    });
});

app.use((req, res) => {
    const pathWithoutQuery = decodeURIComponent(req.path.split('?')[0]);
    let filePath = `./${pathWithoutQuery}`;
    let ext = filePath.split('.').pop().toLowerCase();

    if (pathWithoutQuery.lastIndexOf('.') === -1) {
        filePath += '.html';
        ext = 'html';
    }

    const mimeTypes = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'txt': 'text/plain',
        'flac': 'audio/flac',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send('文件未找到');
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(500).send('读取文件时发生错误');
                return;
            }

            res.setHeader('Content-Type', mimeType);
            res.status(200).send(data);
        });
    });
});

app.listen(port, () => {
    console.log('聊天测试服务已启动');
    console.log(`服务器已在${port}号端口启动访问地址: http://localhost:${port}`);
});