import MindMap from "simple-mind-map";
import { Context } from "../context";
import BaseWidget from "./BaseWidget";
import i18n from "../i18n";
import ejs from "ejs"

const TPL = `
<div class="input-group input-group-sm mb-3">
<div class="input-group-prepend">
    <span class="input-group-text"><%= backdrops.linkUrl %></span>
</div>
<input name="urlLinkContent" type="text" class="form-control" placeholder="<%= backdrops.linkUrlPlaceholder %>" />
</div>
<div class="input-group input-group-sm mb-3">
<div class="input-group-prepend">
    <span class="input-group-text"><%= backdrops.linkName %></span>
</div>
<input name="urlTextContent" type="text" class="form-control" />
</div>
<div class="quick-search input-group input-group-sm mb-3">
  <style>
    .quick-search {
        padding: 10px 10px 10px 0px;
        height: 50px;
    }
  
    .quick-search .dropdown-menu {
        max-height: 600px;
        max-width: 400px;
        overflow-y: auto;
        overflow-x: auto;
        text-overflow: ellipsis;
        box-shadow: -30px 50px 93px -50px black;
    }
  </style>
  <div class="input-group-prepend">
    <button class="btn btn-outline-secondary search-button" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="bx bx-search"></span>
    </button>
    <div class="dropdown-menu dropdown-menu-left"></div>
  </div>
  <input type="text" class="form-control search-string" placeholder="快速添加笔记超链接">
  </div>
</div>`;

const MAX_DISPLAYED_NOTES = 15;

export default class QuickSearchWidget extends BaseWidget{
    $searchString: JQuery<HTMLElement>;
    $dropdownMenu: JQuery<HTMLElement>;
    $dropdownToggle: JQuery<HTMLElement>;
    isShowUrl: any;
    constructor(opt:{context:Context, mindMap:typeof MindMap, i18n: i18n, isShowUrl: boolean}){
        super();
        this.context = opt.context;
        this.mindMap = opt.mindMap;
        this.config = this.context.config;
        this.i18n = opt.i18n
        this.isShowUrl = opt.isShowUrl
	}

    get renderOn(){
        return "backdrops"
    }
    
    doRender() {
        this.$widget = $(ejs.render(TPL, {backdrops:this.i18n.p("backdrops")}, {async:false}) as string);

        this.$searchString = this.$widget.find('.search-string');
        this.$dropdownMenu = this.$widget.find('.dropdown-menu');
        this.$dropdownToggle = this.$widget.find('.search-button');
        // bootstrap
        // @ts-ignore
        this.$dropdownToggle.dropdown();

        this.$widget.find('.input-group-prepend').on('shown.bs.dropdown', () => this.search());
        
        this.$searchString.keydown(e =>{
            if(e.which === 13) {
                if (this.$dropdownMenu.is(":visible")) {
                    this.search(); // just update already visible dropdown
                } else {
                    // @ts-ignore
                    this.$dropdownToggle.dropdown('show');
                }
                e.preventDefault();
                e.stopPropagation();
            }
        })

        return this.$widget;
    }

    async search() {
        // @ts-ignore
        const searchString = this.$searchString.val().trim();

        if (!searchString) {
            // @ts-ignore
            this.$dropdownToggle.dropdown("hide");
            return;
        }

        this.$dropdownMenu.empty();
        this.$dropdownMenu.append('<span class="dropdown-item disabled"><span class="bx bx-loader bx-spin"></span> Searching ...</span>');

        const searchResultNotes = await api.searchForNotes(searchString);

        const displayedNotes = searchResultNotes.slice(0, Math.min(MAX_DISPLAYED_NOTES, searchResultNotes.length));

        this.$dropdownMenu.empty();

        if (displayedNotes.length === 0) {
            this.$dropdownMenu.append('<span class="dropdown-item disabled">No results found</span>');
        }

        for (const note of displayedNotes) {
            const $link = await api.createLink(note.noteId, {showNotePath: true,showNoteIcon:true});
            const $a = $link.find("a");
            $link.addClass('dropdown-item');
            $link.attr("tabIndex", "0");
            let urlLink = $a.attr("href")??"";
            let urlTitle = $a.text();
            if(!this.isShowUrl){
                $a.replaceWith($(`<span value="${urlLink}">${urlTitle}</span>`))
            }
            $link.on('click', e => {
                // @ts-ignore
                this.$dropdownToggle.dropdown("hide");

                this.callback(e, {url:urlLink, title:urlTitle});
                if (!e.target || e.target.nodeName !== 'A') {
                    this.$widget.find('input[name="urlLinkContent"]').val(urlLink);
                    this.$widget.find('input[name="urlTextContent"]').val(urlTitle);
                }
            });

            this.$dropdownMenu.append($link);
        }

        if (searchResultNotes.length > MAX_DISPLAYED_NOTES) {
            this.$dropdownMenu.append(`<span class="dropdown-item disabled">... and ${searchResultNotes.length - MAX_DISPLAYED_NOTES} more results.</span>`);
        }

        // @ts-ignore
        this.$dropdownToggle.dropdown('update');
    }
    callback(e: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>, arg1: { url: string | undefined; title: string; }) {
        throw new Error("Method not implemented.");
    }
}