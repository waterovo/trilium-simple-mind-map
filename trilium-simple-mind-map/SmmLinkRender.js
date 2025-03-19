/*
测试版本
使用此插件时，请注意备份数据
*/
const MindMap = simpleMindMapcommonjs.default;
const Themes = themescjsminjs.default;
Themes.init(MindMap);
customThemeList.forEach(themeConfig=>{
    MindMap.defineTheme(themeConfig.value, themeConfig.theme);
});
const themeList = [
    {
        name: '默认主题',
        value: 'default',
        dark: false
    },
    ...Themes.lightList, ...Themes.darkList, ...customThemeList];

const TPL = `<div></div>`;

class SmmLinkRender extends api.NoteContextAwareWidget {
    static get parentWidget() {
        return "note-detail-pane";
    }
    isEnabled() {
        return super.isEnabled();
    }

    doRender() {
        super.doRender();
        this.$widget = $(TPL);
        $(document).on("mouseenter", "a", mouseEnterHandler);
    }
    
    async refreshWithNote(note) {
    }
}
    
function mouseEnterHandler() {
    setTimeout(async () => {
        const $link = $(this);
        const url = $link.attr("href") || $link.attr("data-href");
        const linkId = $link.attr("data-link-id") || "";
        if(url===""||linkId === ""){
            return;
        }
        const noteId = getNoteIdFromUrl(url);
        if(noteId === null){
            return;
        }
        const content = await utils.getData(noteId);
        if(content===null){
            return;
        }
        
        const $el = $(document).find(`.${linkId}`);
        
        $el.find(".rendered-content").empty().append($(`<div id="mindMapContainer-${linkId}" style="min-width:400px;height:400px;"><div>`))
        
        const mind_note_obj = JSON.parse(content);
        
        let theme = mind_note_obj.theme.template;
        let not_find_theme = false;
        if(themeList.findIndex(t=>{return t.value==theme}) === -1){
            // 替换主题，让导图能正常加载
            mind_note_obj.theme.template = "classic4";
            not_find_theme = true;
        }
        
        const mindMap = new MindMap({
            el: document.getElementById(`mindMapContainer-${linkId}`),
            //initRootNodePosition: ['center', 'left'],
            readonly: true
        });
        mindMap.setFullData(mind_note_obj);
        if(not_find_theme){
            // 重新加载主题，修复字体颜色错误
            mindMap.setTheme("classic4");
        }
    }, 550);
}
function refreshIncludedNote($container, noteId) {
    if ($container) {
        $container.find(`section[data-note-id="${noteId}"]`).each((_, el) => {
            this.loadIncludedNote(noteId, $(el));
        });
    }
}

function getNoteIdFromUrl(urlOrNotePath) {
    if (!urlOrNotePath) {
        return null;
    }

    const hashIdx = urlOrNotePath.indexOf('#');
    if (hashIdx === -1) {
        return null;
    }

    const hash = urlOrNotePath.substr(hashIdx + 1); // strip also the initial '#'
    const [notePath, paramString] = hash.split("?");

    if (!notePath.match(/^[_a-z0-9]{4,}(\/[_a-z0-9]{4,})*$/i)) {
        return null;
    }
    
    const segments = notePath.split("/");

    return segments[segments.length - 1];
}

module.exports = SmmLinkRender;