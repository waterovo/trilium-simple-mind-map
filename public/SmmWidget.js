
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
        && this.note.hasLabel('simpleMindMap')
        && this.note.isContentAvailable()
        && this.noteContext?.viewScope.viewMode === 'default';
    }
    
    async doRender() {
        this.$widget = $(WIDGET_TPL);
        this.contentSized();
        // css move to #appCss
        // this.cssBlock(styles);
        this.$render = this.$widget.find('.smm-render');
        this.$render.attr('id', this.componentId);
        return this.$widget;
    }
    
    async renderWidget() {
        const context = {
        	"widget": this.$widget,
            "note": this.note,
            "config": {
                showSource: false,
                lang: "zh",
                useLeftKeySelectionRightKeyDrag: false,
                imageNoteType: "svg",
                exportType: "note",
                helpUrl: ""
            }
        }
        this.smmRender = new SmmRender(context);
        await this.smmRender.init();
    }
    
    async refreshWithNote(note) {
        $(document).ready(async()=>{
            await this.refreshWidget();
        });
    }
    
    async refreshWidget() {
        await this.renderWidget();
    }
}

module.exports = SmmWidget;