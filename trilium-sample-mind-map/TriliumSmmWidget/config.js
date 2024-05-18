// 用于插件版本区分
const SMM_WDIGET_VERSION = "v1.0.0";

// 获取template笔记ID
const templateNote = await api.searchForNote(`#smmWidgetTemplate AND note.parents.labels.smmWidgetVersion="${SMM_WDIGET_VERSION}"`);
const SMM_TPL_NOTE_ID = templateNote.noteId;

// 获取css笔记ID
const cssNotesQuery = await api.searchForNotes(`#smmWidgetCss AND note.parents.labels.smmWidgetVersion="${SMM_WDIGET_VERSION}"`);
var CSS_NOTE_ID_LIST = [];

const IMAGE_NOTE_TYPE = "svg";
const HELP_URL = "https://github.com/waterovo/trilium-sample-mind-map";
        
for ( let i = 0; i < cssNotesQuery.length; i++ ) {
    const note = cssNotesQuery[i];
    CSS_NOTE_ID_LIST.push(note.noteId);
}

module.exports = {
    SMM_TPL_NOTE_ID,
    CSS_NOTE_ID_LIST,
    IMAGE_NOTE_TYPE,
    HELP_URL
}