const TEMPLATE = `
<link rel="stylesheet" href="https://unpkg.com/simple-mind-map@0.12.1/dist/simpleMindMap.esm.css">
<style>
    .mindMapContainer * {
        margin: 0;
        padding: 0;
    }
    .mindMapContainer {
        width: 100%;
        height: 100%;
        min-height: 80vh;
    }
</style>`;


class SmmTextNoteRenderWidget extends api.NoteContextAwareWidget {
    constructor(...args) {
        super(...args);
        this.isFirstRun = true;
    }

    get position() { 
        return 100; 
    } 

    get parentWidget() { return 'center-pane'; }

    isEnabled() {
        return super.isEnabled() 
        && this.note.type === 'text';
    }

    doRender() {
        this.$widget = $(TEMPLATE);
        this.$widget.hide();

        return this.$widget;
    }
    
    async noteSwitchedEvent({noteContext, notePath}) {
        super.noteSwitchedEvent({noteContext, notePath});
    }
    
    async injectLoadIncludedNote(textEditor){
        if(this.isFirstRun){
            // 适配next
            if(!this.isReadOnly){
                if(textEditor==null){
                	return;
                }
            }
            this.isFirstRun = false;
            var getNoteContainer = async ()=> {
                if (this.isReadOnly) {
                    return await this.noteContext.getContentElement();
                } else {
                    return $(textEditor.editing.view.getDomRoot());
                }
            }
            const $content = await getNoteContainer();
            const component = glob.getComponentByEl($content);
            // component => ReadOnlyTextTypeWidget => AbstractTextTypeWidget
            const AbstractTextTypeWidget = Object.getPrototypeOf(Object.getPrototypeOf(component));
            const _loadIncludedNote = AbstractTextTypeWidget.loadIncludedNote;
            AbstractTextTypeWidget.loadIncludedNote = async (noteId, $el) => {
                const note = await api.getNote(noteId);
                const blob = await note.getBlob();
                if(note.getAttributeValue("label", "simpleMindMap")==null){
                    await _loadIncludedNote(noteId, $el);
                }else{
                    const containerElId = Math.random().toString(36).substr(2, 9);
                    const tpl = `<div class="include-note-content" style="width:100%;height:100%;min-height:70vh;">
                <div id="mindMapContainer-${containerElId}" class="mindMapContainer"></div>
                <script type="module">
                    import {default as MindMap} from 'https://unpkg.com/simple-mind-map@0.12.1/dist/simpleMindMap.esm.min.js';
                    import { default as Themes } from 'https://unpkg.com/simple-mind-map-plugin-themes@1.0.0/dist/themes.esm.min.js';
                    Themes.init(MindMap)
                    const mindMap${containerElId} = new MindMap({
                        el: document.getElementById('mindMapContainer-${containerElId}'),
                        readonly: true
                    });
                    const data = ${blob.content};
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
                </script></div>`;
                    $el.empty().append($(tpl));
                }
            }
            if(this.isReadOnly){
                $content.find("section").each(async (_, el) => {
                    const noteId = $(el).attr('data-note-id');
                    component.loadIncludedNote(noteId, $(el));
                });
            }
        }
    }

    async refreshWithNote(note) {
        if (this.note.type === 'text') {
            const noteContext = this.noteContext;
            this.isReadOnly = await noteContext.isReadOnly();
            if(this.isFirstRun){
                $(document).ready(async ()=>{
                    setTimeout(async ()=>{
                        const editor = await api.getActiveContextTextEditor();
                        await this.injectLoadIncludedNote(editor);
                    }, 100);
                    // 重载编辑器内容
                    await api.activateNote(this.note.noteId)
                })
            }
        }
    }

    async entitiesReloadedEvent({loadResults}) {
        if (loadResults.isNoteContentReloaded(this.noteId)) {
            this.refresh();
        }
    }
}

const widget = new SmmTextNoteRenderWidget()
module.exports = widget;