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

app.get('/api/getnote', (req, res) => {
    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            data = JSON.parse(data);
            res.json(data[req.query.id]);
        }
    });
})

app.get('/api/search', (req, res) => {
    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const key = req.query.s;
            let notes = JSON.parse(data);

            const results = notes.map((note, index) => {
                const isMatch =
                    note.title.toLowerCase().includes(key.toLowerCase()) ||
                    note.markdown.toLowerCase().includes(key.toLowerCase()) ||
                    note.tags.some(tag => tag.toLowerCase().includes(key.toLowerCase()));

                if (isMatch) {
                    return {
                        id: index,
                        title: note.title,
                        markdown: note.markdown,
                        tags: note.tags
                    };
                }
            }).filter(note => note !== undefined);

            res.json(results);
        }
    });
})

app.get('/api/addnote', (req, res) => {
    let { title, markdown, tags } = req.query;
    title = decodeURIComponent(title);
    markdown = decodeURIComponent(markdown);
    tags = decodeURIComponent(tags);

    if (!title || !markdown) {
        return res.status(400).json({ error: '缺少必要参数：标题或内容' });
    }

    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '读取笔记文件失败' });
        }

        let notes = JSON.parse(data);
        const newNote = {
            title,
            markdown,
            tags: tags ? tags.split(',') : [],
        };

        notes.push(newNote);

        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: '写入笔记文件失败' });
            }

            res.json({ message: '笔记添加成功', note: notes.length - 1 });
        });
    });
});

app.get('/api/delete', (req, res) => {
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: '无效的笔记 ID' });
    }

    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '读取笔记文件失败' });
        }

        let notes = JSON.parse(data);
        if (id < 0 || id >= notes.length) {
            return res.status(404).json({ error: '笔记不存在' });
        }

        notes.splice(id, 1);

        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: '写入笔记文件失败' });
            }

            res.json({ message: '笔记删除成功' });
        });
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