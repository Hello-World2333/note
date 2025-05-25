const UI = {
    error(a) {
        const b = document.getElementById("error");
        b.classList.remove("hidden");
        b.innerHTML = a;
        console.error(a);
        setTimeout(() => {
            b.classList.add("hidden");
        }, 3000);
    },
    msg(c) {
        const d = document.getElementById("msg");
        d.classList.remove("hidden");
        d.innerHTML = c;
        setTimeout(() => {
            d.classList.add("hidden");
        }, 3000);
    },
    startLoad(e) {
        const f = document.getElementById("load");
        f.classList.remove("hidden");
        const g = document.getElementById("load-span");
        g.innerHTML = e;
    },
    endLoad() {
        const h = document.getElementById("load");
        h.classList.add("hidden");
    }
};
async function safeFetch(i, j = {}) {
    try {
        const k = { method: 'GET' };
        const l = { ...k, ...j };

        const m = await fetch(i, l);
        if (m.ok) {
            const n = await m.json();
            return { ok: true, data: n };
        } else {
            const o = `请求失败 状态码: ${m.status}`;
            UI.error(o);
            return { ok: false, msg: o };
        }
    } catch (p) {
        UI.error(p.message || "未知错误");
        return { ok: false, msg: p.message || "未知错误" };
    }
}

async function tosearch(q = null) {
    let r;
    if (q) {
        r = q;
    } else {
        r = document.getElementById("search").value;
    }
    if (r) {
        location.href = `/search?s=${r}`;
    }
}

function goHome() {
    window.location.href = "/";
}

function handleKeyPress(s) {
    if (s.key === 'Enter') {
        tosearch();
    }
}

function toAddNote() {
    window.location.href = "/addNote";
}

function createNoteCard(t) {
    let u = '';
    t.tags.forEach(v => {
        u += `<tag onclick="tosearch('${v}')">${v}</tag>`;
    });
    return `<notecard onclick="openNote('${t.id}')">
        <h1>${t.title}</h1>
        <views>
            <img src="/view.svg">${t.views}
        </views>
        <tags>${u}</tags>
        <hr>
        ${marked.parse(t.markdown.slice(0,100)+"...")}
    </notecard>`;
}

function createNote(w) {
    let x = '';
    w.tags.forEach(y => {
        x += `<tag onclick="tosearch('${y}')">${y}</tag>`;
    });
    return `<note id="note">
        <h1>${w.title}</h1>
        <views>
            <img src="/view.svg">${w.views}
        </views>
        <tags>${x}</tags>
        <hr>
        ${marked.parse(w.markdown)}
    </note>`;
}

function openNote(z) {
    location.href = `./note?id=${z}`;
}

document.addEventListener('click', (A) => {
    if (A.target.matches('pre')) {
        const B = A.target.textContent.trim();

        const C = document.createElement('textarea');
        C.value = B;
        document.body.appendChild(C);
        C.select();
        document.execCommand('copy');
        document.body.removeChild(C);
        UI.msg("复制成功")
    }
});