
import MindMap from "simple-mind-map"
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines'
import OuterFrame from "simple-mind-map/src/plugins/OuterFrame"
import AssociativeLine from "simple-mind-map/src/plugins/AssociativeLine"
import Export from "simple-mind-map/src/plugins/Export"
// import ExportPDF from "simple-mind-map/src/plugins/ExportPDF"
// import ExportXMind from "simple-mind-map/src/plugins/ExportXMind"
import Drag from "simple-mind-map/src/plugins/Drag"
import Select from "simple-mind-map/src/plugins/Select"
import RichText from "simple-mind-map/src/plugins/RichText"
import Themes from 'simple-mind-map-plugin-themes'
import { nodeIconList } from 'simple-mind-map/src/svg/icons'
import { Context } from './context'
import i18n from './i18n'
import utils from './utils'
import renderToolbarTpl from "./views/toolbar"
import renderLeftTopMenuTpl from "./views/leftTopMenu"
import renderBackdropsTpl from "./views/backdrops"
import BaseWidget from "./widgets/BaseWidget"
import RichTextToolbarWidget from "./widgets/RichTextToolbarWidget"
import QuickSearchWidget from "./widgets/QuickSearchWidget"
import IconListWidget from "./widgets/IconListWidget"

MindMap.usePlugin(RainbowLines)
    .usePlugin(OuterFrame)
    .usePlugin(AssociativeLine)
    // .usePlugin(ExportPDF)
    // .usePlugin(ExportXMind)
    .usePlugin(Export)
    .usePlugin(Drag)
    .usePlugin(Select)
    .usePlugin(TouchEvent)
    .usePlugin(RichText)

Themes.init(MindMap)

export default class SmmRender {
    initialized: boolean;
    smmContainerId: string;
    MindMap: typeof MindMap;
    activeNodes: any[];
    themeList: any[];
    iconList: any;
    toolbarBtnsRole: { unselected: { id: string; enabled: boolean; }[]; root: { id: string; enabled: boolean; }[]; node: { id: string; enabled: boolean; }[]; generalization: { id: string; enabled: boolean; }[]; };
    context: Context
    mindMap: MindMap
    t: (position: string, key: string) => string
    i18n: any
    $render: JQuery<HTMLElement>
    isStart: boolean
    isEnd: boolean
    outerFramePositionBtnShow: boolean
    outerFramePosition: { left: string; top: string }
    $nodeOuterFrameContainer: any
    $backdrops: any
    constructor(context: Context){
        this.context = context
        this.smmContainerId = "smm_container";
        this.MindMap = MindMap;
        this.initialized = false;
        this.activeNodes = [];
        this.themeList = [
            {
                name: '默认主题',
                value: 'default',
                dark: false
            },
            ...Themes.lightList, ...Themes.darkList].reverse();
        this.iconList = nodeIconList;
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
                {id:'smm_add_outer_frame',enabled:false},
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
                {id:'smm_add_outer_frame',enabled:true},
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
                {id:'smm_add_outer_frame',enabled:true},
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
                {id:'smm_add_outer_frame',enabled:false},
            ],
        };
        this.i18n = new i18n(this.context.config.lang)
    }

    async init() {
        this.$render = this.context.widget.find('.smm-render')
        this.$render.append($(`<div id="smm_container" class="smm-container"></div>`))
        this.$render.append($(renderToolbarTpl({toolbar:this.i18n.p("toolbar")})))
        this.$render.append($(renderLeftTopMenuTpl({leftTopMenu:this.i18n.p("leftTopMenu")})))
        this.$backdrops = $(renderBackdropsTpl({backdrops:this.i18n.p("backdrops")}))
        this.$render.append(this.$backdrops)
        this.$render.append(`
<div class="smm-components-container">
    <div id="nodeOuterFrameContainer">
        <div class="smm-outer-frame-btn" id="smm_delete_outer_frame">
            <span class="bx bx-trash iconfont"></span>
        </div>
    </div>
</div>`)
        
        // 移动元素到渲染位置
        {
            let smmwComponentId = this.context.widget.parent().attr("data-component-id");
            if(this.context.config.showSource){
                this.context.widget.addClass("smm-show-source");
                this.context.widget.removeClass("smm-hide-source");
            }else{
                this.context.widget.parent().css("position", "relative");
                this.context.widget.addClass("smm-hide-source");
                this.context.widget.removeClass("smm-show-source");
            }

            this.smmContainerId = `smm_container_${smmwComponentId}`;
            let $smm_container = this.context.widget.find('#smm_container');
            $smm_container.attr("id", this.smmContainerId);
            this.context.widget.insertBefore(this.context.widget.parent().find('.mermaid-widget'));
            this.context.widget.addClass("scrolling-container");
        }

        await this.render_mind_data();

        this.toolbar_render();
        this.register_toolbar_event();
        this.register_components_event();
        this.register_smmtools();
        this.register_widget(RichTextToolbarWidget, {})
        this.register_widget(QuickSearchWidget, {id:"urlLinkBackdrop", showUrl: false})
        this.register_widget(IconListWidget, {id:"iconListBackdrop", iconList:this.iconList, activeNodes:this.activeNodes, smmRender: this})
        // 清理可能残留的backdrops
        this.context.widget.parent().children('.smm-backdrops-container').remove();
        this.$backdrops.insertBefore(this.context.widget);
    }

    register_widget(Widget:typeof BaseWidget, opt:any) {
        const widget = new Widget({context:this.context, mindMap:this.mindMap, i18n:this.i18n, ...opt})
        switch (widget.renderOn){
            case "components":
                let $components = this.$render.find(".smm-components-container")
                $components.append(widget.doRender())
                break
            case "backdrops":
                let $modalBody = this.$backdrops.find(`#${opt.id} .modal-body`);
                $modalBody.append(widget.doRender());
                break
        }
    }

    async render_mind_data() {
        if (this.context.note.isJson()) {
            // 获取源笔记
            let mind_note_data = await this.context.note.getContent();
            // 打开笔记数据
            if (!this.initialized) {
                this.create_mind_map(mind_note_data);
                this.initialized = true;
            }
            
            console.log("smm render success");
        }
    }

    create_mind_map(mind_note_data) {
        const opt = {
            el: this.context.widget.find(`#${this.smmContainerId}`).get(0),
            initRootNodePosition: ['center', 'center'],
            layout: 'logicalStructure',
        }
        // @ts-ignore
        this.mindMap = new MindMap(opt);

        // 初始化彩虹线条
        // @ts-ignore
        this.mindMap.rainbowLines.updateRainLinesConfig(this.context.config.rainbowLinesConfig??false);

        let mind_note_obj = JSON.parse(mind_note_data);
        let theme = mind_note_obj.theme.template;
        if(this.themeList.findIndex(t=>{return t.value==theme}) === -1){
            mind_note_obj.theme.template = "classic4";
            // 当前导图笔记的主题不存在，自动更换为默认主题
            api.showMessage(this.i18n.t("showMessage", "themeNotExist"));
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
        
        this.outerFramePositionBtnShow = false;
        this.outerFramePosition = {
            left: "0px",
            top: "0px"
        }
        
        this.$nodeOuterFrameContainer = this.$render.find('#nodeOuterFrameContainer');
        
        // 外框事件监听
        this.mindMap.on('outer_frame_active', (el, parentNode, range) => {
            // 取范围内第一个节点的外框样式
            const firstNode = parentNode.children[range[0]];
            const firstNodeOuterFrame = firstNode.getData('outerFrame');
            /*
            Object.keys(firstNodeOuterFrame).forEach(key => {
            this.styleConfig[key] = firstNodeOuterFrame[key]
            })*/
            // 获取外框的位置大小信息
            const { x, y, width } = el.rbox();
            this.outerFramePosition.left = x + width + 'px';
            this.outerFramePosition.top = y + 'px';
            this.outerFramePositionBtnShow = true;
            this.$nodeOuterFrameContainer.css(this.outerFramePosition);
            this.$nodeOuterFrameContainer.addClass('smm-outer-frame-active');
        })
        
        const hide = () => {
            this.outerFramePositionBtnShow = false;
            this.$nodeOuterFrameContainer.removeClass('smm-outer-frame-active');
        }
        
        this.mindMap.on('scale', hide);
        this.mindMap.on('translate', hide);
        this.mindMap.on('svg_mousedown', hide);
        this.mindMap.on('expand_btn_click', hide);
        this.mindMap.on('outer_frame_delete', hide);
    }

    save_mind_note() {
        let mind_data = this.mindMap.getData(true);
        let mind_str = JSON.stringify(mind_data);
        utils.setData(this.context.note.noteId, this.context.note.title, mind_str);
    }

    set_note_link_target(regex=/^#root/, target='_self'){
        this.context.widget.find('.smm-container svg g.smm-node a').each((index, element)=>{
            let $a:JQuery<HTMLElement> = $(element);
            if(regex.test($a.attr("href")??"")){
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
        let $btn = this.context.widget.find(`.smm-toolbar-btn#${btn_id}`);
        if(enabled){
            $btn.removeClass("disabled");
        }else{
            $btn.addClass("disabled");
        }
    }

    register_toolbar_event() {
        this.$render.find('.smm-toolbar-btn#smm_back').on("click", ()=>!this.isStart&&this.back());
        this.$render.find('.smm-toolbar-btn#smm_forward').on("click", ()=>!this.isEnd&&this.forward());
        this.$render.find('.smm-toolbar-btn#smm_delete_node').on("click", ()=>this.delete_node());
        this.$render.find('.smm-toolbar-btn#smm_insert_node').on("click", ()=>this.insert_node());
        this.$render.find('.smm-toolbar-btn#smm_insert_child_node').on("click", ()=>this.insert_child_node());
        this.$render.find('.smm-toolbar-btn#smm_insert_image').on("click", ()=>this.insert_image());
        this.$render.find('.smm-toolbar-btn#smm_insert_url').on("click", ()=>this.insert_url());
        this.$render.find('.smm-toolbar-btn#smm_insert_icon').on("click", ()=>this.insert_icon());
        this.$render.find('.smm-toolbar-btn#smm_insert_remark').on("click", ()=>this.insert_remark());
        this.$render.find('.smm-toolbar-btn#smm_insert_ga').on("click", ()=>this.insert_ga());
        this.$render.find('.smm-toolbar-btn#smm_insert_relation_line').on("click", ()=>this.insert_relation_line());
        this.$render.find('.smm-toolbar-btn#smm_add_outer_frame').on("click", ()=>this.add_outer_frame());
    }

       
    register_components_event() {
        this.$render.find('.smm-components-container #nodeOuterFrameContainer #smm_delete_outer_frame').on("click", ()=>this.delete_outer_frame());
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
        this.$backdrops.find('#imageSave').on("click", ()=>{
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
        this.$backdrops.find('#urlLinkSave').on("click", ()=>{
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
        this.$backdrops.find('#remarkSave').on("click", ()=>{
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
        // @ts-ignore
        this.mindMap.associativeLine.createLineFromActiveNode();
    }
    
    add_outer_frame() {
        this.mindMap.execCommand('ADD_OUTER_FRAME', [], {fill: "transparent"});
    }
    
    delete_outer_frame() {
        this.outerFramePositionBtnShow = false;
        this.$nodeOuterFrameContainer.removeClass('smm-outer-frame-active');
        // @ts-ignore
        this.mindMap.outerFrame.removeActiveOuterFrame();
    }

    /**
     * 工具菜单操作
     */
    register_smmtools() {
        let $smmtools_menu = this.$render.find('#smmtools_menu');
        let $smmtools_area = this.$render.find('#smm_tools');
        let $smmtools_save_imagenote = this.$render.find('#smmtools_save_imagenote');

        let $smmtools_help = this.$render.find('#smmtools_help');
 
        $smmtools_menu.on("click", () => {
            this.switch_fullscreen_button();
            $smmtools_area.toggleClass('smm-tools-active');
        });

        this.register_fullscreen_event();

        this.register_fulltab_event();

        $(document).on("click", function (event) {
            let target = $(event.target); // 获取点击事件的目标元素

            if (target.closest($smmtools_area).length > 0) {
                // 目标元素在指定区域内,不做任何操作
            } else {
                // 目标元素不在指定区域内,执行关闭操作
                $smmtools_area.removeClass('smm-tools-active');
            }
        });

        $smmtools_save_imagenote.on("click", () => {
            let fileType = this.context.config.imageNoteType;
            this.mindMap.export(fileType, false).then((content)=>{
                if(this.context.config.exportType === 'note'){
                    utils.createImageNote(this.context.note.noteId, `simple-mind-map-export.${fileType}`, fileType, content).then((res) => {
                        // 图像笔记已经创建成功了！
                        api.showMessage(this.i18n.t("showMessage","imageNoteCreated"));
                    });
                }else{
                    utils.createImageAttachment(this.context.note.noteId, `simple-mind-map-export.${fileType}`, fileType, content).then((res) => {
                        // 图像附件已经创建成功了！
                        api.showMessage(this.i18n.t("showMessage","imageAttachmentCreated"));
                    });
                }
            });
        });

        $smmtools_help.on("click", () => {
            this.open_help_info();
        });

        this.render_smm_export_select();
        this.render_smm_mouse_select();
        this.render_smm_rainbow_lines_select();
        this.render_smm_theme_select();
        this.render_smm_struct_select();
    }

    
    switch_fullscreen_button = () => {
        if(is_page_fullscreen()){
            this.$render.addClass("full");
            this.context.widget.find('#smmtools_enter_fullscreen').addClass('hidden-ext');
            this.context.widget.find('#smmtools_exit_fullscreen').removeClass('hidden-ext');
        }else{
            this.$render.removeClass("full");
            this.context.widget.find('#smmtools_enter_fullscreen').removeClass('hidden-ext');
            this.context.widget.find('#smmtools_exit_fullscreen').addClass('hidden-ext');
        }
    }

    register_fullscreen_event() {
        this.switch_fullscreen_button();
    
        // 全屏点击事件
        this.context.widget.find('#smmtools_enter_fullscreen').on("click", () => {
            var elem = document.body;
            full_screen(elem, ()=>{});
        });
        
        // 退出全屏点击事件
        this.context.widget.find('#smmtools_exit_fullscreen').on("click", () => {
            exit_full_screen();
        });
        
        window.addEventListener("resize", (event) => {
            try{
                this.mindMap.resize();
            }catch(e){
                // 忽略报错
            }
            this.switch_fullscreen_button();
        }, true);
    }
    
    register_fulltab_event(){
        let $smmtools_enterfulltab = this.context.widget.find('#smmtools_enter_fulltab');
        let $smmtools_exitfulltab = this.context.widget.find('#smmtools_exit_fulltab');
        $smmtools_enterfulltab.click(()=>{
            this.context.widget.parent().css("position", "relative");
            this.context.widget.addClass("smm-hide-source");
            this.context.widget.removeClass("smm-show-source");
            $smmtools_enterfulltab.addClass('hidden-ext');
            $smmtools_exitfulltab.removeClass('hidden-ext');
            this.mindMap.resize();
        });
        $smmtools_exitfulltab.click(()=>{
            this.context.widget.parent().css("position", '');
            this.context.widget.addClass("smm-show-source");
            this.context.widget.removeClass("smm-hide-source");
            $smmtools_enterfulltab.removeClass('hidden-ext');
            $smmtools_exitfulltab.addClass('hidden-ext');
            this.mindMap.resize();
        });
        if(this.context.config.showSource){
            $smmtools_enterfulltab.removeClass('hidden-ext');
            $smmtools_exitfulltab.addClass('hidden-ext');
        }else{
            $smmtools_enterfulltab.addClass('hidden-ext');
            $smmtools_exitfulltab.removeClass('hidden-ext');
        }
    }

    render_smm_export_select() {
        let $export_select = this.context.widget.find('#smmtools_export select');
        $export_select.val("");
        $export_select.on('change', (e) => {
            let exportType = $(e.target).children('option:selected').val();
            this.mindMap.export(exportType, true, this.context.note.title);
            $(e.target).val("");
        });
    }
    
    render_smm_mouse_select() {
        let $mouse_select = this.context.widget.find('#smmtools_mouse_select select');
        $mouse_select.val(this.context.config.useLeftKeySelectionRightKeyDrag?"1":"0");
        this.mindMap.updateConfig({
            useLeftKeySelectionRightKeyDrag: this.context.config.useLeftKeySelectionRightKeyDrag
        });
        $mouse_select.on('change', (e) => {
            if($(e.target).children('option:selected').val()=="0"){
                this.context.config.useLeftKeySelectionRightKeyDrag = false;
            }else{
                this.context.config.useLeftKeySelectionRightKeyDrag = true;
            }
            this.mindMap.updateConfig({
                useLeftKeySelectionRightKeyDrag: this.context.config.useLeftKeySelectionRightKeyDrag
           });
        });
    }
    
    render_smm_rainbow_lines_select() {
        let $rainbow_lines_select = this.context.widget.find('#smmtools_rainbow_lines select');
        $rainbow_lines_select.val(this.mindMap.opt.rainbowLinesConfig.open?"1":"0");
        $rainbow_lines_select.on('change', (e) => {
            // @ts-ignore
            this.mindMap.rainbowLines.updateRainLinesConfig({open:$(e.target).children('option:selected').val()=="1"?true:false});
        });
    }

    render_smm_theme_select() {
        let $theme_select = this.$render.find('#smmtools_theme select');
        
        const add_row = (theme) => {
            if(this.context.config.lang==="en"){
                $theme_select.append(`<option value="${theme.value}">${theme.value}</option>`);
            }else{
                $theme_select.append(`<option value="${theme.value}">${theme.name}</option>`);
            }
        }
        for (const theme of this.themeList) {     
            add_row(theme);
        }

        $theme_select.val(this.mindMap.getTheme());
        $theme_select.on('change', (e) => {
            this.mindMap.setTheme($(e.target).children('option:selected').val());
            this.save_mind_note();
        });
    }

    render_smm_struct_select() {
        let $struct_select = this.$render.find('#smmtools_struct select');
        $struct_select.val(this.mindMap.getLayout());
        $struct_select.on('change', (e) => {
            this.mindMap.setLayout($(e.target).children('option:selected').val());
            this.save_mind_note();
        });
    }
    
    open_help_info() {
        let win = window.open(this.context.config.helpUrl, '_blank');
        // @ts-ignore
        win.focus();
    }
}


function is_page_fullscreen() {
    // @ts-ignore
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
        // @ts-ignore
    } else if (document.mozCancelFullScreen) {
        // @ts-ignore
        document.mozCancelFullScreen();
        // @ts-ignore
    } else if (document.webkitExitFullscreen) {
        // @ts-ignore
        document.webkitExitFullscreen();
        // @ts-ignore
    } else if (document.msExitFullscreen) {
        // @ts-ignore
        document.msExitFullscreen();
    }
}

