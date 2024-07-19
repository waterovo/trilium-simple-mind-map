const MindMap = simpleMindMapcommonjs.default;

class SmmRender {
    constructor() {
        this.smmNote = api.getActiveContextNote();
        this.smmContainerId = "smm_container";
        this.MindMap = MindMap;
        this.initialized = false;
        this.activeNodes = [];
        this.init_custom_theme();
        this.themeList = Object.keys(MindMap.themes).reverse();
        this.iconList = MindMap.iconList;
        this.useLeftKeySelectionRightKeyDrag = config.LKSRKD;
        this.toolbarBtnsRole = {
            "unselected": [
                {id:'smm_delete_node',enabled:false},
                {id:'smm_insert_node',enabled:false},
                {id:'smm_insert_child_node',enabled:false},
                {id:'smm_insert_image',enabled:false},
                {id:'smm_insert_url',enabled:false},
                {id:'smm_insert_icon',enabled:false},
                {id:'smm_insert_remark',enabled:false},
                {id:'smm_insert_ga',enabled:false},
                {id:'smm_insert_relation_line',enabled:false},
            ],
            "root": [
                {id:'smm_delete_node',enabled:true},
                {id:'smm_insert_node',enabled:false},
                {id:'smm_insert_child_node',enabled:true},
                {id:'smm_insert_image',enabled:true},
                {id:'smm_insert_url',enabled:true},
                {id:'smm_insert_icon',enabled:true},
                {id:'smm_insert_remark',enabled:true},
                {id:'smm_insert_ga',enabled:false},
                {id:'smm_insert_relation_line',enabled:true},
            ],
            "node": [
                {id:'smm_delete_node',enabled:true},
                {id:'smm_insert_node',enabled:true},
                {id:'smm_insert_child_node',enabled:true},
                {id:'smm_insert_image',enabled:true},
                {id:'smm_insert_url',enabled:true},
                {id:'smm_insert_icon',enabled:true},
                {id:'smm_insert_remark',enabled:true},
                {id:'smm_insert_ga',enabled:true},
                {id:'smm_insert_relation_line',enabled:true},
            ],
            "generalization": [
                {id:'smm_delete_node',enabled:true},
                {id:'smm_insert_node',enabled:false},
                {id:'smm_insert_child_node',enabled:false},
                {id:'smm_insert_image',enabled:true},
                {id:'smm_insert_url',enabled:true},
                {id:'smm_insert_icon',enabled:true},
                {id:'smm_insert_remark',enabled:true},
                {id:'smm_insert_ga',enabled:false},
                {id:'smm_insert_relation_line',enabled:false},
            ],
        };
    }
    
    init_custom_theme() {
        customThemeList.forEach(themeConfig=>{
            MindMap.defineTheme(themeConfig.value, themeConfig.theme);
        });
    }

    async init(smmWidget) {
        this.smmWidget = smmWidget;
        this.$widget = this.smmWidget.$widget;

        if(true || config.RENDER_ON === "note-detail"){
            let smmwComponentId = this.$widget.parent().attr("data-component-id");
            if(config.SHOW_SOURCE){
                this.$widget.addClass("smm-show-source");
                this.$widget.removeClass("smm-hide-source");
            }else{
                this.$widget.parent().css("position", "relative");
                this.$widget.addClass("smm-hide-source");
                this.$widget.removeClass("smm-show-source");
            }

            this.smmContainerId = `smm_container_${smmwComponentId}`;
            let $smm_container = this.$widget.find('#smm_container');
            $smm_container.attr("id", this.smmContainerId);
            this.$widget.insertBefore(this.$widget.parent().find('.mermaid-widget'));
            this.$widget.addClass("scrolling-container");
        }

        await this.render_mind_data();
        
        this.toolbar_render();
        this.register_toolbar_event();
        this.register_smmtools();
    }
    
    register_backdrop(backdropWidgets){
        this.$backdrops = this.$widget.find(".smm-backdrops-container");
        this.$backdrops.insertBefore(this.$widget);
        for(const widget of backdropWidgets){
            let $modalBody = this.$backdrops.find(`#${widget.id} .modal-body`);
            $modalBody.append(widget.obj.doRender());
        }
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
            
            console.log("smm render success");
        }
    }

    create_mind_map(mind_note_data) {
        this.mindMap = new MindMap({
            el: this.$widget.find(`#${this.smmContainerId}`).get(0),
            initRootNodePosition: ['center', 'center'],
            layout: 'logicalStructure'
        });

        let mind_note_obj = JSON.parse(mind_note_data);
        let theme = mind_note_obj.theme.template;
        if(this.themeList.findIndex(t=>{return t==theme}) === -1){
            mind_note_obj.theme.template = "classic4";
            api.showMessage("当前导图笔记的主题不存在，自动更换为默认主题");
        }
        this.mindMap.setFullData(mind_note_obj);

        // 监听节点激活事件
        this.mindMap.on('node_active', (node, nodeList) => {
            this.activeNodes = nodeList;
            this.toolbar_render();
        })

        this.mindMap.on('data_change', data => {
            this.save_mind_note();
        })
        
        this.mindMap.on('node_tree_render_end', data => {
            // 笔记超链接设置为当前页打开
            this.set_note_link_target();
        })
        
        this.isStart = true
        this.isEnd = true
        this.mindMap.on('back_forward', (index, len) => {
            this.isStart = index <= 0
            this.isEnd = index >= len - 1
            // 改变按钮可用状态
            this.toolbar_btn_toggle_status('smm_back', !this.isStart);
            this.toolbar_btn_toggle_status('smm_forward', !this.isEnd);
        })
    }
    
    smm_resize() {
        this.mindMap.resize();
    }
    
    set_note_link_target(regex=/^#root/, target='_self'){
        this.$widget.find('.smm-container svg g.smm-node a').each((index, element)=>{
            let $a = $(element);
            if(regex.test($a.attr("href"))){
                $a.attr("target", target);
            }
        })
    }
    
    toolbar_render() {
        if(this.activeNodes.length === 0){
           this.toolbarBtnsRole["unselected"].forEach(toolbarBtn => {
               this.toolbar_btn_toggle_status(toolbarBtn.id, toolbarBtn.enabled);
           })
            return;
        }
        if(this.has_generalization()){
            this.toolbarBtnsRole["generalization"].forEach(toolbarBtn => {
                this.toolbar_btn_toggle_status(toolbarBtn.id, toolbarBtn.enabled);
            })
            return;
        }
        if(this.has_root()){
            this.toolbarBtnsRole["root"].forEach(toolbarBtn => {
                this.toolbar_btn_toggle_status(toolbarBtn.id, toolbarBtn.enabled);
            })
            return;
        }
        this.toolbarBtnsRole["node"].forEach(toolbarBtn => {
            this.toolbar_btn_toggle_status(toolbarBtn.id, toolbarBtn.enabled);
        })
    }
    
    has_root() {
        return this.activeNodes.findIndex(node => {
            return node.isRoot
        }) !== -1
    }

    has_generalization() {
        return this.activeNodes.findIndex(node => {
            return node.isGeneralization
        }) !== -1
    }
    
    toolbar_btn_toggle_status(btn_id, enabled) {
        let $btn = this.$widget.find(`.smm-toolbar-btn#${btn_id}`);
        if(enabled){
            $btn.removeClass("disabled");
        }else{
            $btn.addClass("disabled");
        }
    }

    save_mind_note() {
        let mind_data = this.mindMap.getData(true);
        let mind_str = JSON.stringify(mind_data);
        utils.setData(this.smmNote.noteId, this.smmNote.title, mind_str);
    }
    
    register_toolbar_event() {
        this.$widget.find('.smm-toolbar-btn#smm_back').click(()=>!this.isStart&&this.back());
        this.$widget.find('.smm-toolbar-btn#smm_forward').click(()=>!this.isEnd&&this.forward());
        this.$widget.find('.smm-toolbar-btn#smm_delete_node').click(()=>this.delete_node());
        this.$widget.find('.smm-toolbar-btn#smm_insert_node').click(()=>this.insert_node());
        this.$widget.find('.smm-toolbar-btn#smm_insert_child_node').click(()=>this.insert_child_node());
        this.$widget.find('.smm-toolbar-btn#smm_insert_image').click(()=>this.insert_image());
        this.$widget.find('.smm-toolbar-btn#smm_insert_url').click(()=>this.insert_url());
        this.$widget.find('.smm-toolbar-btn#smm_insert_icon').click(()=>this.insert_icon());
        this.$widget.find('.smm-toolbar-btn#smm_insert_remark').click(()=>this.insert_remark());
        this.$widget.find('.smm-toolbar-btn#smm_insert_ga').click(()=>this.insert_ga());
        this.$widget.find('.smm-toolbar-btn#smm_insert_relation_line').click(()=>this.insert_relation_line());
    }
    
    // 回退
    back() {
        this.mindMap.execCommand('BACK');
        this.save_mind_note();
    }

    // 前进
    forward() {
        this.mindMap.execCommand('FORWARD');
        this.save_mind_note();
    }
    
    delete_node() {
        this.mindMap.execCommand('REMOVE_NODE');
    }

    // 插入兄弟节点
    insert_node() {
        this.mindMap.execCommand('INSERT_NODE');
    }

    // 插入子节点
    insert_child_node() {
        this.mindMap.execCommand('INSERT_CHILD_NODE');
    }
    
    insert_image() {
        let imageUrl = "";
        let imageTitle = "";
        this.activeNodes.forEach(node => {
            if(!!node.getData('image')&&node.getData('image')!==""){
                imageUrl = node.getData('image');
                imageTitle = node.getData('imageTitle');
            }
        })

        this.$backdrops.find('#imageBackdrop input[name="imageUrlContent"]').val(imageUrl);
        this.$backdrops.find('#imageBackdrop input[name="imageTitleContent"]').val(imageTitle);
        this.$backdrops.find('#imageBackdrop').modal('show');
        this.$backdrops.find('#imageSave').click(()=>{
            imageUrl = this.$backdrops.find('#imageBackdrop input[name="imageUrlContent"]').val();
            imageTitle = this.$backdrops.find('#imageBackdrop input[name="imageTitleContent"]').val();
            
            let imageWidth = 100;
            let imageHeight = 100;
            this.activeNodes.forEach(node => {
                node.setImage({
                    url: imageUrl,
                    title: imageTitle,
                    width: imageWidth,
                    height: imageHeight
                })
            })
            this.$backdrops.find('#imageBackdrop').modal('hide');
        });
    }
    
    insert_url() {
        let hyperlink = "";
        let hyperlinkTitle = "";
        this.activeNodes.length==1 && this.activeNodes.forEach(node => {
            if(!!node.getData('hyperlink')&&node.getData('hyperlink')!==""){
                hyperlink = node.getData('hyperlink');
                hyperlinkTitle = node.getData('hyperlinkTitle');
            }
        })

        this.$backdrops.find('#urlLinkBackdrop input[name="urlLinkContent"]').val(hyperlink);
        this.$backdrops.find('#urlLinkBackdrop input[name="urlTextContent"]').val(hyperlinkTitle);
        this.$backdrops.find('#urlLinkBackdrop').modal('show');
        this.$backdrops.find('#urlLinkSave').click(()=>{
            hyperlink = this.$backdrops.find('#urlLinkBackdrop input[name="urlLinkContent"]').val();
            hyperlinkTitle = this.$backdrops.find('#urlLinkBackdrop input[name="urlTextContent"]').val();
            this.activeNodes.forEach(node => {
                node.setHyperlink(hyperlink, hyperlinkTitle);
            })
            this.$backdrops.find('#urlLinkBackdrop').modal('hide');
        });
    }
    
    insert_icon() {
        let iconList = [];
        if (this.activeNodes.length > 0) {
            if (this.activeNodes.length === 1) {
                let firstNode = this.activeNodes[0]
                iconList = firstNode.getData('icon') || [];
            }
        }
        this.set_icon_selected(iconList);
        this.$backdrops.find('#iconListBackdrop').modal('show');
    }
    
    set_icon_selected(iconList) {
        this.$backdrops.find(`.icon-box .icon-list .icon`).removeClass("selected");
        for(const name of iconList){
            let $icon = this.$backdrops.find(`.icon-box .icon-list .icon[name="${name}"]`);
            $icon.addClass("selected");
        }
    }
    
    // 插入备注
    insert_remark() {
        let content = "";
        this.activeNodes.forEach(node => {
            if(!!node.getData('note')&&node.getData('note')!=="")
                content = node.getData('note');
        })
        this.$backdrops.find('#remarkBackdrop textarea[name="remarkContent"]').val(content);
        this.$backdrops.find('#remarkBackdrop').modal('show');
        this.$backdrops.find('#remarkSave').click(()=>{
            content = this.$backdrops.find('#remarkBackdrop textarea[name="remarkContent"]').val();
            this.activeNodes.forEach(node => {
                node.setNote(content);
            })
            this.$backdrops.find('#remarkBackdrop').modal('hide');
        });
    }
    
    // 插入概要
    insert_ga() {
        this.mindMap.execCommand('ADD_GENERALIZATION');
    }
    
    insert_relation_line() {
        this.mindMap.associativeLine.createLineFromActiveNode();
    }
    
    /**
     * 工具菜单操作
     */
    register_smmtools() {
        let $smmtools_menu = this.$widget.find('#smmtools_menu');
        let $smmtools_area = this.$widget.find('#smm_tools');
        let $smmtools_save_imagenote = this.$widget.find('#smmtools_save_imagenote');

        let $smmtools_help = this.$widget.find('#smmtools_help');
 
        $smmtools_menu.click(() => {
            this.switch_fullscreen_button();
            $smmtools_area.toggleClass('smm-tools-active');
        });

        this.register_fullscreen_event();

        this.register_fulltab_event();

        $(document).click(function (event) {
            let target = $(event.target); // 获取点击事件的目标元素

            if (target.closest($smmtools_area).length > 0) {
                // 目标元素在指定区域内,不做任何操作
            } else {
                // 目标元素不在指定区域内,执行关闭操作
                $smmtools_area.removeClass('smm-tools-active');
            }
        });

        $smmtools_save_imagenote.click(() => {
            let fileType = config.IMAGE_NOTE_TYPE;
            this.mindMap.export(fileType, false).then((content)=>{
                if(config.EXPORT_TYPE === 'note'){
                    utils.createImageNote(this.smmNote.noteId, `simple-mind-map-export.${fileType}`, fileType, content).then((res) => {
                        api.showMessage("图像笔记已经创建成功了！");
                    });
                }else{
                    utils.createImageAttachment(this.smmNote.noteId, `simple-mind-map-export.${fileType}`, fileType, content).then((res) => {
                        api.showMessage("图像附件已经创建成功了！");
                    });
                }
            });
        });

        $smmtools_help.click(() => {
            this.open_help_info();
        });

        this.render_smm_export_select();
        this.render_smm_mouse_select();
        this.render_smm_theme_select();
        this.render_smm_struct_select();
    }

    switch_fullscreen_button = () => {
        if(is_page_fullscreen()){
            this.smmWidget.$render.addClass("full");
            this.$widget.find('#smmtools_enter_fullscreen').addClass('hidden-ext');
            this.$widget.find('#smmtools_exit_fullscreen').removeClass('hidden-ext');
        }else{
            this.smmWidget.$render.removeClass("full");
            this.$widget.find('#smmtools_enter_fullscreen').removeClass('hidden-ext');
            this.$widget.find('#smmtools_exit_fullscreen').addClass('hidden-ext');
        }
    }

    register_fullscreen_event() {
        this.switch_fullscreen_button();
    
        // 全屏点击事件
        this.$widget.find('#smmtools_enter_fullscreen').click(() => {
            var elem = document.body;
            full_screen(elem);
        });
        
        // 退出全屏点击事件
        this.$widget.find('#smmtools_exit_fullscreen').click(() => {
            exit_full_screen();
        });
        
        window.addEventListener("resize", (event) => {
            try{
                this.smm_resize();
            }catch(e){
                // 忽略报错
            }
            this.switch_fullscreen_button();
        }, true);
    }
    
    register_fulltab_event(){
        let $smmtools_enterfulltab = this.$widget.find('#smmtools_enter_fulltab');
        let $smmtools_exitfulltab = this.$widget.find('#smmtools_exit_fulltab');
        $smmtools_enterfulltab.click(()=>{
            this.$widget.parent().css("position", "relative");
            this.$widget.addClass("smm-hide-source");
            this.$widget.removeClass("smm-show-source");
            $smmtools_enterfulltab.addClass('hidden-ext');
            $smmtools_exitfulltab.removeClass('hidden-ext');
            this.smm_resize();
        });
        $smmtools_exitfulltab.click(()=>{
            this.$widget.parent().css("position", '');
            this.$widget.addClass("smm-show-source");
            this.$widget.removeClass("smm-hide-source");
            $smmtools_enterfulltab.removeClass('hidden-ext');
            $smmtools_exitfulltab.addClass('hidden-ext');
            this.smm_resize();
        });
        if(config.SHOW_SOURCE){
            $smmtools_enterfulltab.removeClass('hidden-ext');
            $smmtools_exitfulltab.addClass('hidden-ext');
        }else{
            $smmtools_enterfulltab.addClass('hidden-ext');
            $smmtools_exitfulltab.removeClass('hidden-ext');
        }
    }

    render_smm_export_select() {
        let $export_select = this.$widget.find('#smmtools_export select');
        $export_select.val("");
        $export_select.on('change', (e) => {
            let exportType = $(e.target).children('option:selected').val();
            this.mindMap.export(exportType, true, this.smmNote.title);
            $(e.target).val("");
        });
    }
    
    render_smm_mouse_select() {
        let $mouse_select = this.$widget.find('#smmtools_mouse_select select');
        
        $mouse_select.on('change', (e) => {
            if($(e.target).children('option:selected').val()=="0"){
                this.useLeftKeySelectionRightKeyDrag = false;
            }else{
                this.useLeftKeySelectionRightKeyDrag = true;
            }
            this.mindMap.updateConfig({
                useLeftKeySelectionRightKeyDrag: this.useLeftKeySelectionRightKeyDrag
           });
        });
    }

    render_smm_theme_select() {
        let $theme_select = this.$widget.find('#smmtools_theme select');
        for (const theme of this.themeList) {     
            add_row(theme);
        }
        function add_row(theme) {
            $theme_select.append(`<option value="${theme}">${theme}</option>`);
        }

        $theme_select.val(this.mindMap.getTheme());
        $theme_select.on('change', (e) => {
            this.mindMap.setTheme($(e.target).children('option:selected').val());
        });
    }

    render_smm_struct_select() {
        let $struct_select = this.$widget.find('#smmtools_struct select');
        $struct_select.val(this.mindMap.getLayout());
        $struct_select.on('change', (e) => {
            this.mindMap.setLayout($(e.target).children('option:selected').val());
            this.save_mind_note();
        });
    }
    
    open_help_info() {
        let win = window.open(config.HELP_URL, '_blank');
        win.focus();
    }
}

function is_page_fullscreen() {
    return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function full_screen(dom, FullscreenCallback) {
    if (dom.requestFullscreen) {
        dom.requestFullscreen()
        .then(() => {
            FullscreenCallback && FullscreenCallback();
        });
    } else if (dom.mozRequestFullScreen) {
        dom.mozRequestFullScreen()
        .then(() => {
            FullscreenCallback && FullscreenCallback();
        });
    } else if (dom.webkitRequestFullScreen) {
        dom.webkitRequestFullScreen()
        .then(() => {
            FullscreenCallback && FullscreenCallback();
        });
    }
}

function exit_full_screen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}


module.exports = SmmRender;