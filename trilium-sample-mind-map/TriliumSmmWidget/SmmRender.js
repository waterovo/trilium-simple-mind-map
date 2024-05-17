const MindMap = simpleMindMapcommonjs.default;

class SmmRender {
    constructor() {
        this.smmNote = api.getActiveContextNote();
        this.smmContainerId = "smm_container";
        this.MindMap = MindMap;
        this.initialized = false;
        this.activeNodes = []
    }

    async init(smmWidget) {
        this.smmWidget = smmWidget;
        this.$widget = this.smmWidget.$widget;

        if(true || config.RENDER_ON === "note-detail"){
            let smmwComponentId = this.$widget.parent().attr("data-component-id");

            this.smmContainerId = `smm_container_${smmwComponentId}`;
            let $smm_container = this.$widget.find('#smm_container');
            $smm_container.attr("id", this.smmContainerId);
            this.$widget.insertBefore(this.$widget.parent().find('.mermaid-widget'));
            this.$widget.addClass("scrolling-container");
        }

        await this.render_mind_data();


    }


    async render_mind_data() {
        if (this.smmNote.isJson()) {
            // 获取源笔记
            let mind_note_data = await utils.getData(this.smmNote.noteId);
            // 打开笔记数据
            if (!this.initialized) {
                this.create_mind_map(mind_note_data);
                this.initialized = true;
            }
            //this.open_smm_note(mind_data);
            console.log("smm render success");
        }
    }

    create_mind_map(mind_note_data) {
        this.mindMap = new MindMap({
            el: document.getElementById(this.smmContainerId),
            initRootNodePosition: ['center', 'center'],
            layout: 'logicalStructure'
        });
        this.mindMap.setFullData(JSON.parse(mind_note_data));

        // 监听节点激活事件
        this.mindMap.on('node_active', (node, nodeList) => {
            this.activeNodes.value = nodeList;
        })

        this.mindMap.on('data_change', data => {
            this.save_mind_note();
        })
    }

    save_mind_note() {
        let mind_data = this.mindMap.getData(true);
        let mind_str = JSON.stringify(mind_data);
        let meta_name = this.smmNote.title;
        utils.setData(this.smmNote.noteId, meta_name, mind_str);
    }
}

module.exports = SmmRender;