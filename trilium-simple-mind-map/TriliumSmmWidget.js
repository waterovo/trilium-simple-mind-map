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
        && this.note.hasLabel('simpleMindMap')
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
        this.renderQuickSearchWidget();
        this.smmRender = new SmmRender();
        await this.smmRender.init(this);
        
        this.smmRender.register_backdrop([{id:"iconListBackdrop",obj:new SmmIconWidget(this.smmRender, (name)=>{console.log(name, this.smmRender.activeNodes);})
        }]);
    }
    
    renderQuickSearchWidget() {
        let $backdrops = this.$render.find(".smm-backdrops-container");
        let $modalBody = $backdrops.find("#urlLinkBackdrop .modal-body");
        this.qsWidget = new QuickSearchWidget((e, noteLink)=>{
            if (!e.target || e.target.nodeName !== 'A') {
                $backdrops.find('#urlLinkBackdrop input[name="urlLinkContent"]').val(noteLink.url);
                $backdrops.find('#urlLinkBackdrop input[name="urlTextContent"]').val(noteLink.title);
            }
        }, false);
        $modalBody.append(this.qsWidget.doRender());
    }
    
    async refreshWithNote(note) {
        await this.refreshWidget();
    }
    
    async refreshWidget() {
        await this.renderWidget();
    }
}

module.exports = SmmWidget;