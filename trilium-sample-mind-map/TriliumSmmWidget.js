let TPL = await utils.getData(config.SMM_TPL_NOTE_ID);
let styles = ``;
let cssArr = await utils.getNoteConetntList(config.CSS_NOTE_ID_LIST);
for (const cssData of cssArr) {
    styles += cssData;
}

let WIDGET_TPL = `<div class="smm-widget">
    <div id="[to be set]" class="smm-render"></div>
</div>`;

class SmmWidget extends api.NoteContextAwareWidget {
    static get parentWidget() {
        return "note-detail-pane";
    }
    
    isEnabled() {
        return super.isEnabled() 
        && this.note.type === 'code' 
        && this.note.mime==="application/json" 
        && this.note.hasLabel('sampleMindMap')
        && this.note.isContentAvailable()
        && this.noteContext?.viewScope.viewMode === 'default';
    }
    
    async doRender() {
        this.$widget = $(WIDGET_TPL);
        this.contentSized();
        this.cssBlock(styles);
        this.$render = this.$widget.find('.smm-render');
        this.$render.attr('id', this.componentId);
        return this.$widget;
    }
    
    async renderWidget() {
        let $template = $(TPL);
        this.$render.html($template);
        this.smmRender = new SmmRender();
        await this.smmRender.init(this);
    }
    
    async refreshWithNote(note) {
        await this.refreshWidget();
    }
    
    async refreshWidget() {
        await this.renderWidget();
    }
}

module.exports = SmmWidget;