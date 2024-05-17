// 获取css笔记内容
async function getNoteConetntList(noteIdList) {
    const noteContentArr = JSON.parse(await api.runAsyncOnBackendWithManualTransactionHandling(async(noteIdList) => {
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
    api.runAsyncOnBackendWithManualTransactionHandling(async(noteId, noteTitle, noteConetnt) => {
        const note = await api.getNote(noteId);
        note.title = noteTitle;
        note.setContent(noteConetnt);
    }, [noteId, noteTitle, noteConetnt]);
}

function setRelation(noteId, name, value) {
    api.runAsyncOnBackendWithManualTransactionHandling(async(noteId, name, value) => {
        const note = await api.getNote(noteId);
        note.setRelation(name, value);
    }, [noteId, name, value]);
}

function setLabel(noteId, name, value) {
    api.runAsyncOnBackendWithManualTransactionHandling(async(noteId, name, value) => {
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

async function createImageNote(parentNoteId, title, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, content) => {
        let imageNote = api.searchForNote(`#jsMindImageAttachment AND note.parents.noteId='${parentNoteId}' AND note.title='${title}'`);
        const imageData = Buffer.from(content.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        if(imageNote===null){
            const noteParams = {
                parentNoteId: parentNoteId,
                title: title,
                content: imageData,
                type: "image",
            }
            var obj = api.createNewNote(noteParams);
            imageNote = obj.note;
        }else{
            imageNote.setContent(imageData);
        }
        
        imageNote.mime = "image/png";
        imageNote.setLabel("jsMindImageAttachment");
        imageNote.save();
        // 目前无法将笔记附件直接关联到其他笔记
        /*
        const parentNote = api.getNote(parentNoteId);
        let attachment = parentNote.getAttachmentByTitle(title);
        api.log(attachment);
        if(!attachment){
            const noteParams = {
                parentNoteId: parentNoteId,
                title: title,
                content: imageData,
                type: "image",
            }
            var obj = api.createNewNote(noteParams);
            obj.note.mime = "image/png";
            obj.note.save();
            let attachment = obj.note.convertToParentAttachment();
            if(!attachment){
                attachment = obj.note.convertToParentAttachment();
            }
        }else{
            api.log(attachment.attachmentId);
            attachment.setContent(imageData);
            attachment.save();
        }*/
    }, [parentNoteId, title, content]);
}
module.exports = {
    getNoteConetntList,
    getData,
    setData,
    setRelation,
    setLabel,
    createDataNote,
    createImageNote
}
