const express = require('express');
const fs = require('fs');
const app = express();
const port = 11451;

fs.readFile('notes.json', 'utf-8', (err, data) => {
    if (err) {
        console.error('读取 notes.json 文件失败:', err);
        return;
    }

    let notes = JSON.parse(data);
    let isModified = false;

    notes.forEach(note => {
        if (!note.id) {
            note.id = crypto.randomUUID();
            isModified = true;
        }
        if (note.views === undefined) {
            note.views = 0;
            isModified = true;
        }
    });

    if (isModified) {
        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('写入 notes.json 文件失败:', err);
            } else {
                console.log('已为笔记分配 ID 并更新 notes.json 文件');
            }
        });
    }
});

app.use(express.json());

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
            let notes = JSON.parse(data);
            const index = notes.findIndex(note => note.id === req.query.id);

            if (index === -1) {
                return res.status(404).json({ error: '笔记不存在' });
            }

            notes[index].views += 1;

            fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('更新笔记阅读量失败:', err);
                }
            });

            res.json(notes[index]);
        }
    });
})

app.post('/api/search', async (req, res) => {
    const key = req.body.s;
    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            let notes = JSON.parse(data);

            const results = notes.map(note => {
                const isMatch =
                    note.title.toLowerCase().includes(key.toLowerCase()) ||
                    note.markdown.toLowerCase().includes(key.toLowerCase()) ||
                    note.tags.some(tag => tag.toLowerCase().includes(key.toLowerCase()));

                if (isMatch) {
                    return {
                        id: note.id,
                        title: note.title,
                        markdown: note.markdown,
                        tags: note.tags,
                        views: note.views
                    };
                }
            }).filter(note => note !== undefined);

            res.json(results);
        }
    });
})

app.post('/api/addnote', async (req, res) => {
    let { title, markdown, tags } = req.body;
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
            id: crypto.randomUUID(),
            title,
            markdown,
            tags: tags ? tags.split(',') : [],
        };

        notes.push(newNote);

        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: '写入笔记文件失败' });
            }

            logOperation('新增笔记', newNote.id);

            res.json({ message: '笔记添加成功', note: newNote.id });
        });
    });
});

app.post('/api/updatenote', async (req, res) => {
    const { id, title, markdown, tags } = req.body;

    if (!id) {
        return res.status(400).json({ error: '缺少必要参数：笔记 ID' });
    }

    if (!title || !markdown) {
        return res.status(400).json({ error: '请提供更新内容' });
    }

    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '读取笔记文件失败' });
        }

        let notes = JSON.parse(data);
        const index = notes.findIndex(note => note.id === id);

        if (index === -1) {
            return res.status(404).json({ error: '笔记不存在' });
        }

        const updatedNote = {
            ...notes[index],
            ...(title && { title: decodeURIComponent(title) }),
            ...(markdown && { markdown: decodeURIComponent(markdown) }),
            ...(tags && { tags: decodeURIComponent(tags).split(',') })
        };

        notes[index] = updatedNote;

        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: '写入笔记文件失败' });
            }

            logOperation('更新笔记', id);

            res.json({ message: '笔记更新成功', note: updatedNote });
        });
    });
});

app.get('/api/delete', (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: '无效的笔记 ID' });
    }

    fs.readFile('notes.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: '读取笔记文件失败' });
        }

        let notes = JSON.parse(data);
        const index = notes.findIndex(note => note.id === id);
        if (index === -1) {
            return res.status(404).json({ error: '笔记不存在' });
        }

        notes.splice(index, 1);

        fs.writeFile('notes.json', JSON.stringify(notes, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: '写入笔记文件失败' });
            }

            logOperation('删除笔记', id);

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
    console.log('笔记服务器启动成功');
    console.log(`服务器已在${port}号端口启动访问地址: http://localhost:${port}`);
});

function logOperation(operation, uuid) {
    const now = new Date();
    const logFileName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.log`;
    const logMessage = `[${now.toISOString()}] ${operation} - UUID: ${uuid}\n`;

    fs.appendFile(logFileName, logMessage, (err) => {
        if (err) {
            console.error('写入日志文件失败:', err);
        }
    });
}
