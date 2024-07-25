// 用于插件版本区分
const SMM_WDIGET_VERSION = "v1.1.0";

// 获取template笔记ID
const templateNote = await api.searchForNote(`#smmWidgetTemplate AND note.parents.labels.smmWidgetVersion="${SMM_WDIGET_VERSION}"`);
const SMM_TPL_NOTE_ID = templateNote.noteId;

// 获取css笔记ID
const cssNotesQuery = await api.searchForNotes(`#smmWidgetCss AND note.parents.labels.smmWidgetVersion="${SMM_WDIGET_VERSION}"`);

var CSS_NOTE_ID_LIST = [];

// svg OR png
const IMAGE_NOTE_TYPE = "svg";

// attachement OR note
const EXPORT_TYPE = "note"; //！attachement为实验功能，暂时无法适配复制按钮

// 左键框选，右键拖动
const LKSRKD = false;

// 是否显示编辑框
const SHOW_SOURCE = false; //！实验功能，可能会出现样式错乱

//zh_cn,en_us
const LANGUAGE = 'zh_cn';

const lang = language[LANGUAGE];

const HELP_URL = "https://github.com/waterovo/trilium-simple-mind-map";
        
for ( let i = 0; i < cssNotesQuery.length; i++ ) {
    const note = cssNotesQuery[i];
    CSS_NOTE_ID_LIST.push(note.noteId);
}

module.exports = {
    SMM_TPL_NOTE_ID,
    CSS_NOTE_ID_LIST,
    IMAGE_NOTE_TYPE,
    EXPORT_TYPE,
    SHOW_SOURCE,
    HELP_URL,
    LANGUAGE,
    lang
}