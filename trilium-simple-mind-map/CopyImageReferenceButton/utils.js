function copyImageReferenceToClipboard($imageWrapper) {
    try {
        $imageWrapper.attr('contenteditable', 'true');
        selectImage($imageWrapper.get(0));

        const success = document.execCommand('copy');

        if (success) {
            api.showMessage("Image copied to the clipboard");
        } else {
            api.showMessage("Could not copy the image to clipboard.");
        }
    }
    finally {
        window.getSelection().removeAllRanges();
        $imageWrapper.removeAttr('contenteditable');
    }
}

function selectImage(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
}

function createImageSrcUrl(noteId, title) {
    return `api/images/${noteId}/${encodeURIComponent(title)}?timestamp=${Date.now()}`;
}

async function getImageNote(searchString) {
    return await api.runOnBackend((searchString) => {
        let imageNote = api.searchForNote(searchString);
        return imageNote;
    }, [searchString]);
}

module.exports = {
    copyImageReferenceToClipboard,
    createImageSrcUrl,
    getImageNote
};