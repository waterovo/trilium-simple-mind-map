import ejs from "ejs"

const TPL = `<div class="smm-toolbar">
    <div class="smm-toolbar-block">
        <div class="smm-toolbar-btn-list">
            <div class="smm-toolbar-btn" id="smm_back"><span class="bx bx-undo icon iconfont"></span><span class="text"><%= toolbar.undo %></span></div>
            <div class="smm-toolbar-btn" id="smm_forward"><span class="bx bx-redo icon iconfont"></span><span class="text"><%= toolbar.redo %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_node"><span class="bx bx-git-branch icon iconfont"></span><span class="text"><%= toolbar.insertSiblingNode %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_child_node"><span class="bx bx-sitemap icon iconfont"></span><span class="text"><%= toolbar.insertChildNode %></span></div>
            <div class="smm-toolbar-btn" id="smm_delete_node"><span class="bx bx-trash icon iconfont"></span><span class="text"><%= toolbar.deleteNode %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_image"><span class="bx bx-image icon iconfont"></span><span class="text"><%= toolbar.image %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_icon"><span class="bx bx-smile icon iconfont"></span><span class="text"><%= toolbar.icon %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_url"><span class="bx bx-link icon iconfont"></span><span class="text"><%= toolbar.link %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_remark"><span class="bx bx-detail icon iconfont"></span><span class="text"><%= toolbar.note %></span></div>
            <div class="smm-toolbar-btn" id="smm_insert_ga"><span class="bx bxs-dashboard icon iconfont"></span><span class="text"><%= toolbar.summary %></span></div>
        </div>
        
        <div class="dropdown">
            <div class="smm-toolbar-btn dropdown-toggle" id="smm_more_dropdown" data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="margin-left: 20px;margin-right: 0px;">
                <span class="bx bxs-shapes icon iconfont"></span><span class="text"><%= toolbar.more %></span>
            </div>
            <div class="dropdown-menu" aria-labelledby="smm_more_dropdown">
                <div class="smm-toolbar-btn-list v">
                    <div class="smm-toolbar-btn" id="smm_insert_relation_line"><span class="bx bx-git-compare icon iconfont"></span><span class="text"><%= toolbar.associativeLine %></span></div>
                    <div class="smm-toolbar-btn" id="smm_add_outer_frame"><span class="bx bx-border-none icon iconfont"></span><span class="text"><%= toolbar.outerFrame %></span></div>
                </div>
            </div>
        </div>
    </div>
</div>`

export default function renderToolbarTpl (data:{}){
    return ejs.render(TPL, data, {async:false}) as string
}