const TPL = `
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
    <button class="btn btn-outline-secondary search-button" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="bx bx-search"></span>
    </button>
    <div class="dropdown-menu dropdown-menu-left"></div>
  </div>
  <input type="text" class="form-control search-string" placeholder="快速添加笔记超链接">
  </div>
</div>`;

const MAX_DISPLAYED_NOTES = 15;

class QuickSearchWidget extends api.BasicWidget{
    constructor(callback, isShowUrl=true) {
        super();
        this.callback = callback;
        this.isShowUrl = isShowUrl;
    }
    
    doRender() {
        this.$widget = $(TPL);

        this.$searchString = this.$widget.find('.search-string');
        this.$dropdownMenu = this.$widget.find('.dropdown-menu');
        this.$dropdownToggle = this.$widget.find('.search-button');
        this.$dropdownToggle.dropdown();

        this.$widget.find('.input-group-prepend').on('shown.bs.dropdown', () => this.search());
        
        this.$searchString.keydown(e =>{
            if(e.which === 13) {
                if (this.$dropdownMenu.is(":visible")) {
                    this.search(); // just update already visible dropdown
                } else {
                    this.$dropdownToggle.dropdown('show');
                }
                e.preventDefault();
                e.stopPropagation();
            }
        })

        return this.$widget;
    }

    async search() {
        const searchString = this.$searchString.val().trim();

        if (!searchString) {
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
            let urlLink = $a.attr("href");
            let urlTitle = $a.text();
            if(!this.isShowUrl){
                $a.replaceWith($(`<span value="${urlLink}">${urlTitle}</span>`))
            }
            $link.on('click', e => {
                this.$dropdownToggle.dropdown("hide");

                this.callback(e, {url:urlLink, title:urlTitle});
            });

            this.$dropdownMenu.append($link);
        }

        if (searchResultNotes.length > MAX_DISPLAYED_NOTES) {
            this.$dropdownMenu.append(`<span class="dropdown-item disabled">... and ${searchResultNotes.length - MAX_DISPLAYED_NOTES} more results.</span>`);
        }

        this.$dropdownToggle.dropdown('update');
    }
}

module.exports = QuickSearchWidget;