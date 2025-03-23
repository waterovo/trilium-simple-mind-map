import ejs from "ejs"

const TPL = `<div id="smm_tools" class="smm-tools">
    <ul class="menu">
        <li id="smmtools_menu" class="menu-item action-trigger title">
            <span class="bx bx-menu" />
            <span class="menu-text"><%= leftTopMenu.menu %></span>
        </li>
        <li class="menu-item menu-divider" />
        <li id="smmtools_enter_fullscreen" class="menu-item action-trigger">
            <span class="bx bx-fullscreen" />
            <span class="menu-text"><%= leftTopMenu.enterFullScreen %></span>
        </li>
        <li id="smmtools_exit_fullscreen" class="menu-item action-trigger">
            <span class="bx bx-exit-fullscreen" />
            <span class="menu-text"><%= leftTopMenu.exitFullScreen %></span>
        </li>
        <li id="smmtools_enter_fulltab" class="menu-item action-trigger">
            <span class="bx bx-expand-alt" />
            <span class="menu-text"><%= leftTopMenu.enterFullTab %></span>
        </li>
        <li id="smmtools_exit_fulltab" class="menu-item action-trigger">
            <span class="bx bx-collapse-alt" />
            <span class="menu-text"><%= leftTopMenu.exitFullTab %></span>
        </li>
        <li class="menu-item menu-divider" />
        <li id="smmtools_export" class="menu-item action-trigger">
            <span class="bx bx-export" />
            <span class="menu-text"><%= leftTopMenu.exportFile %></span>
            <select>
                <option value=""><%= leftTopMenu.selectExportType %></option>
                <option value="png">.png</option>
                <option value="json">.json</option>
                <option value="svg">.svg</option>
                <option value="pdf">.pdf</option>
                <option value="md">.md</option>
                <option value="xmind">.xmind</option>
            </select>
        </li>
        <li id="smmtools_save_imagenote" class="menu-item action-trigger">
            <span class="bx bx-image-add" />
            <span class="menu-text"><%= leftTopMenu.saveAttachment %></span>
        </li>
        <li class="menu-item menu-divider" />
        <li id="smmtools_mouse_select" class="menu-item">
            <span class="bx bx-mouse-alt" />
            <span class="menu-text"><%= leftTopMenu.selection %></span>
            <select style="max-width:180px;">
                <option value="0"><%= leftTopMenu.mouseLeftSelect %></option>
                <option value="1"><%= leftTopMenu.mouseRightSelect %></option>
            </select>
        </li>
        <li id="smmtools_rainbow_lines" class="menu-item">
            <span class="bx bxs-magic-wand" />
            <span class="menu-text"><%= leftTopMenu.rainbowLines %></span>
            <select style="max-width:180px;">
                <option value="0"><%= leftTopMenu.close %></option>
                <option value="1"><%= leftTopMenu.open %></option>
            </select>
        </li>
        <li id="smmtools_struct" class="menu-item">
            <span class="bx bx-grid-alt" />
            <span class="menu-text"><%= leftTopMenu.structure %></span>
            <select>
                <option value="logicalStructure"><%= leftTopMenu.logicalStructure %></option>
                <option value="logicalStructureLeft"><%= leftTopMenu.logicalStructureLeft %></option>
                <option value="mindMap"><%= leftTopMenu.mindMap %></option>
                <option value="organizationStructure"><%= leftTopMenu.organizationStructure %></option>
                <option value="catalogOrganization"><%= leftTopMenu.catalogOrganization %></option>
                <option value="timeline"><%= leftTopMenu.timeline %></option>
                <option value="timeline2"><%= leftTopMenu.timeline2 %></option>
                <option value="fishbone"><%= leftTopMenu.fishbone %></option>
                <option value="verticalTimeline"><%= leftTopMenu.verticalTimeline %></option>
            </select>
        </li>
        <li id="smmtools_theme" class="menu-item">
            <span class="bx bx-palette" />
            <span class="menu-text"><%= leftTopMenu.theme %></span>
            <select>
            </select>
        </li>
        <li class="menu-item menu-divider" />
        <li id="smmtools_help" class="menu-item action-trigger">
            <span class="bx bx-help-circle" />
            <span class="menu-text"><%= leftTopMenu.help %></span>
        </li>
    </ul>
</div>`

export default function renderLeftTopMenuTpl (data:{}){
    return ejs.render(TPL, data, {async:false}) as string
}