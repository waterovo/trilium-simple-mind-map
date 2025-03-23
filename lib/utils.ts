async function createImageNote(parentNoteId, title, fileType, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, fileType, content) => {
        let imageNote = api.searchForNote(`#smmImageAttachment AND note.parents.noteId='${parentNoteId}' AND note.title='${title}'`);
        // @ts-ignore
        let imageData = Buffer.from(content.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''), 'base64');
        function getExtensionFromBase64(base64) {
            let re = new RegExp('data:image/(?<ext>.*?);base64,.*')
            let res = re.exec(base64)
            if (res) {
                // @ts-ignore
                return res.groups.ext
            }
        }
        const imageType = getExtensionFromBase64(content);
        if (fileType === 'svg') {
            // @ts-ignore
            imageData = imageData.toString('utf-8');
        }
        if (imageNote === null) {
            const noteParams = {
                parentNoteId: parentNoteId,
                title: title,
                content: imageData,
                type: "image",
            }
            // @ts-ignore
            var obj = api.createNewNote(noteParams);
            imageNote = obj.note;
        } else {
            // @ts-ignore
            imageNote.setContent(imageData);
        }
        // @ts-ignore
        imageNote.mime = `image/${imageType}`;
        // @ts-ignore
        imageNote.setLabel("smmImageAttachment");
        // @ts-ignore
        imageNote.save();
    }, [parentNoteId, title, fileType, content]);
}

async function createImageAttachment(parentNoteId, title, fileType, content) {
    const noteId = await api.runOnBackend((parentNoteId, title, fileType, content) => {
        // @ts-ignore
        const parentNote = api.getNote(parentNoteId);
        // @ts-ignore
        let attachment = parentNote.getAttachmentByTitle(title);
        // @ts-ignore
        let imageData = Buffer.from(content.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''), 'base64');
        function getExtensionFromBase64(base64) {
            let re = new RegExp('data:image/(?<ext>.*?);base64,.*')
            let res = re.exec(base64)
            if (res) {
                // @ts-ignore
                return res.groups.ext
            }
        }
        const imageType = getExtensionFromBase64(content);
        
        if (fileType === 'svg') {
            // @ts-ignore
            imageData = imageData.toString('utf-8');
        }
        
        if(!attachment){
            // @ts-ignore
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

function setData(noteId, noteTitle, noteConetnt) {
    api.runAsyncOnBackendWithManualTransactionHandling(async (noteId, noteTitle, noteConetnt) => {
        const note = await api.getNote(noteId);
        note.title = noteTitle;
        // @ts-ignore 
        note.setContent(noteConetnt);
    }, [noteId, noteTitle, noteConetnt]);
}

export default {
    setData,
    createImageNote,
    createImageAttachment,
}