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
module.exports = {
    getNoteConetntList,
    getData,
    setData,
    setRelation,
    setLabel,
    createDataNote,
    createImageNote,
    createImageAttachment
}
