// 获取css笔记内容
async function getNoteConetntList(noteIdList) {
    const noteContentArr = JSON.parse(await api.runAsyncOnBackendWithManualTransactionHandling(async (noteIdList) => {
        const noteContentArr = [];
        for (const noteId of noteIdList) {
            const note = await api.getNote(noteId);
            noteContentArr.push(note.getContent());
        }
        return JSON.stringify(noteContentArr);
    }, [noteIdList]));
    return noteContentArr;
}

// 获取笔记内容
async function getData(noteId) {
    const data = await api.runOnBackend((noteId) => {
        const note = api.getNote(noteId);
        return note.getContent();
    }, [noteId]);
    return data;
}

// 获取
function setData(noteId, noteTitle, noteConetnt) {
    api.runAsyncOnBackendWithManualTransactionHandling(async (noteId, noteTitle, noteConetnt) => {
        const note = await api.getNote(noteId);
        note.title = noteTitle;
        note.setContent(noteConetnt);
    }, [noteId, noteTitle, noteConetnt]);
}

function setRelation(noteId, name, value) {
    api.runAsyncOnBackendWithManualTransactionHandling(async (noteId, name, value) => {
        const note = await api.getNote(noteId);
        note.setRelation(name, value);
    }, [noteId, name, value]);
}

function setLabel(noteId, name, value) {
    api.runAsyncOnBackendWithManualTransactionHandling(async (noteId, name, value) => {
        const note = await api.getNote(noteId);
        note.setLabel(name, value);
    }, [noteId, name, value]);
}

async function createDataNote(parentNoteId, title, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, content) => {
        var obj = api.createDataNote(parentNoteId, title, content);
        return obj.note.noteId;
    }, [parentNoteId, title, content]);
    return noteId;
}

async function createImageNote(parentNoteId, title, fileType, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, fileType, content) => {
        let imageNote = api.searchForNote(`#smmImageAttachment AND note.parents.noteId='${parentNoteId}' AND note.title='${title}'`);
        let imageData = Buffer.from(content.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''), 'base64');
        function getExtensionFromBase64(base64) {
            let re = new RegExp('data:image/(?<ext>.*?);base64,.*')
            let res = re.exec(base64)
            if (res) {
                return res.groups.ext
            }
        }
        const imageType = getExtensionFromBase64(content);
        if (fileType === 'svg') {
            imageData = imageData.toString('utf-8');
        }
        if (imageNote === null) {
            const noteParams = {
                parentNoteId: parentNoteId,
                title: title,
                content: imageData,
                type: "image",
            }
            var obj = api.createNewNote(noteParams);
            imageNote = obj.note;
        } else {
            imageNote.setContent(imageData);
        }

        imageNote.mime = `image/${imageType}`;
        imageNote.setLabel("smmImageAttachment");
        imageNote.save();
    }, [parentNoteId, title, fileType, content]);
}

async function createImageAttachment(parentNoteId, title, fileType, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, fileType, content) => {
        const parentNote = api.getNote(parentNoteId);
        let attachment = parentNote.getAttachmentByTitle(title);
        let imageData = Buffer.from(content.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''), 'base64');
        function getExtensionFromBase64(base64) {
            let re = new RegExp('data:image/(?<ext>.*?);base64,.*')
            let res = re.exec(base64)
            if (res) {
                return res.groups.ext
            }
        }
        const imageType = getExtensionFromBase64(content);
        
        if (fileType === 'svg') {
            imageData = imageData.toString('utf-8');
        }
        
        if(!attachment){
            const attachment = parentNote.saveAttachment({
                role: 'image',
                mime: `image/${imageType}`,
                title: title,
                content: imageData
            });
            attachment.utcDateScheduledForErasureSince = null;
            attachment.save();
        }else{
            api.log(attachment.attachmentId);
            attachment.setContent(imageData);
            attachment.utcDateScheduledForErasureSince = null;
            attachment.save();
        }
    }, [parentNoteId, title, fileType, content]);
}

async function renderEjsTemplate(templateId, opts) {
    return await api.runAsyncOnBackendWithManualTransactionHandling(async (templateId, opts)=>{
        const ejs = await import("ejs");
        // Get the template note and content
        const templateNote = api.getNote(templateId);

        // Make sure the note type is correct
        if (templateNote.type === 'code' && templateNote.mime === 'application/x-ejs') {

            // EJS caches the result of this so we don't need to pre-cache
            const includer = (path) => {
                const childNote = templateNote.children.find(n => path === n.title);
                if (!childNote) return null;
                if (childNote.type !== 'code' || childNote.mime !== 'application/x-ejs') return null;
                return { template: childNote.getContent() };
            };

            // Try to render user's template, w/ fallback to default view
            try {
                const ejsResult = ejs.render(templateNote.getContent(), opts, {includer});
                return ejsResult;
            }
            catch (e) {
                api.log(`Rendering user provided share template (${templateId}) threw exception ${e.message} with stacktrace: ${e.stack}`);
            }
        }
        return null;
    },[templateId, opts]);
}

module.exports = {
    getNoteConetntList,
    getData,
    setData,
    setRelation,
    setLabel,
    createDataNote,
    createImageNote,
    createImageAttachment,
    renderEjsTemplate
}
