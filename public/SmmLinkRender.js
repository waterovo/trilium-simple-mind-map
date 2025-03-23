/*
测试版本
使用此插件时，请注意备份数据
*/
const TPL = `<style>
    .rendered-content .mindMapContainer {
         min-width:400px;
         height:400px;
    }
</style>`;

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
        const content = await getData(noteId);
        if(content===null){
            return;
        }
        
        const $el = $(document).find(`.${linkId}`);
        
        const containerElId = Math.random().toString(36).substr(2, 9);
        const tpl = `<div style="height:100%;widget:100%;">
    <div id="mindMapContainer-${containerElId}" class="mindMapContainer"></div>
	<script type="module">
                    import {default as MindMap} from 'https://unpkg.com/simple-mind-map@0.13.1-fix.2/dist/simpleMindMap.esm.min.js';
                    import { default as Themes } from 'https://unpkg.com/simple-mind-map-plugin-themes@1.0.0/dist/themes.esm.min.js';
                    Themes.init(MindMap)
                    const mindMap${containerElId} = new MindMap({
                        el: document.getElementById('mindMapContainer-${containerElId}'),
                        readonly: true
                    });
                    const data = ${content};
                    const themeList = [
                        {
                            name: '默认主题',
                            value: 'default',
                            dark: false
                        },
                        ...Themes.lightList, ...Themes.darkList].reverse();
                    let not_find_theme = false;
                    if(themeList.findIndex(t=>{return t.value==data.theme.template}) === -1){
                        // 替换主题，让导图能正常加载
                        data.theme.template = "classic4";
                        not_find_theme = true;
                    }
                    mindMap${containerElId}.setFullData(data);
                    if(not_find_theme){
                        // 重新加载主题，修复字体颜色错误
                        mindMap${containerElId}.setTheme("classic4");
                    }
                    const set_note_link_target = (regex=/^#root/, target='_self') => {
                        $('#mindMapContainer-${containerElId}').find('svg g.smm-node a').each((index, element)=>{
                            let $a = $(element);
                            if(regex.test($a.attr("href"))){
                                $a.attr("target", target);
                            }
                        })
                    }
                    mindMap${containerElId}.on('node_tree_render_end', data => {
                        // 笔记超链接设置为当前页打开
                        set_note_link_target();
                    })
                </script>
</div>`
        
        $el.find(".rendered-content").empty().append($(tpl))
    }, 550);
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

async function getData(noteId) {
    const data = await api.runOnBackend((noteId) => {
        const note = api.searchForNote(`#SimpleMindMap and note.noteId="${noteId}"`);
        if(note!==null){
            return note.getContent();
        }else{
            return null;
        }
    }, [noteId]);
    return data;
}

module.exports = SmmLinkRender;