const UI = {
    error(err) {
        const errelm = document.getElementById("error");
        errelm.classList.remove("hidden");
        errelm.innerHTML = err;
        console.error(err);
        setTimeout(() => {
            errelm.classList.add("hidden");
        }, 3000);
    },
    msg(text) {
        const msgelm = document.getElementById("msg");
        msgelm.classList.remove("hidden");
        msgelm.innerHTML = text;
        setTimeout(() => {
            msgelm.classList.add("hidden");
        }, 3000);

    },
    startLoad(text) {
        const loadelm = document.getElementById("load");
        loadelm.classList.remove("hidden");
        const loadspan = document.getElementById("load-span");
        loadspan.innerHTML = text;
    },
    endLoad() {
        const loadelm = document.getElementById("load");
        loadelm.classList.add("hidden");
    }
}
async function safeFetch(url, options = {}) {
    try {
        const defaultOptions = { method: 'GET' };
        const finalOptions = { ...defaultOptions, ...options };

        const res = await fetch(url, finalOptions);
        if (res.ok) {
            const data = await res.json();
            return { ok: true, data: data };
        } else {
            const errorMessage = `请求失败 状态码: ${res.status}`;
            UI.error(errorMessage);
            return { ok: false, msg: errorMessage };
        }
    } catch (err) {
        UI.error(err.message || "未知错误");
        return { ok: false, msg: err.message || "未知错误" };
    }
}

async function tosearch(s = null) {
    let key;
    if(s) {
        key = s;
    }
    else {
        key = document.getElementById("search").value;
    }
    if(key) {
        location.href = `/search?s=${key}`;
    }
}

function goHome() {
    window.location.href = "/";
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        tosearch();
    }
}

function toAddNote() {
    window.location.href = "/addNote";
}

function createNoteCard(note) {
    let tagText = '';
    note.tags.forEach(tag => {
        tagText += `<tag onclick="tosearch('${tag}')">${tag}</tag>`;
    });
    return `<notecard onclick="openNote('${note.id}')">
        <h1>${note.title}</h1>
        <tags>${tagText}</tags>
        <hr>
        ${marked.parse(note.markdown)}
    </notecard>`;
}

function createNote(note) {
    let tagText = '';
    note.tags.forEach(tag => {
        tagText += `<tag onclick="tosearch('${tag}')">${tag}</tag>`;
    });
    return `<note>
        <h1>${note.title}</h1>
        <tags>${tagText}</tags>
        <hr>
        ${marked.parse(note.markdown)}
    </note>`;
}

function openNote(id) {
    location.href = `./note?id=${id}`;
}

document.addEventListener('click', (event) => {
    if (event.target.matches('pre')) {
        const codeContent = event.target.textContent.trim();

        const tempInput = document.createElement('textarea');
        tempInput.value = codeContent;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        UI.msg("复制成功")
    }
});