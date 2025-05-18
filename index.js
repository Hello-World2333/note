function showError(err) {
    const errelm = document.getElementById("error");
    errelm.classList.remove("hidden");
    errelm.innerHTML = err;
    setTimeout(() => {
        errelm.classList.add("hidden");
    }, 3000);
}

async function safeFetch(url, options) {
    try {
        const res = await fetch(url, options);
        if (res.ok) {
            const data = await res.json();
            return { ok: true, data: data };
        } else {
            const errorMessage = `请求失败 状态码: ${res.status}`;
            showError(errorMessage);
            return { ok: false, msg: errorMessage };
        }
    } catch (err) {
        showError(err.message || "未知错误");
        return { ok: false, msg: err.message || "未知错误" };
    }
}

function createNote(note) {
    let tagText=''
    note.tags.forEach(tag => {
        tagText+=`<tag>${tag}</tag>`
    });
    return `<note>
        <h1>${note.title}</h1>
        <tags>${tagText}</tags>
        <hr>
        ${marked.parse(note.markdown)}
    </note>`;
}

async function getData() {
    const res = await safeFetch("./notes.json");
    if (res.ok) {
        res.data.forEach(note => {
            document.getElementById("notes-container").innerHTML += createNote(note)
        });
    }
}

getData()