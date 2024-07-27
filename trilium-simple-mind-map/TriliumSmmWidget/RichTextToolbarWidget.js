let TPL = `
<div class="smm-richTextToolbar-widget">
    <style>
    .smm-richTextToolbar-widget.hide {
        display: none;
    }
    .smm-richTextToolbar-widget .richTextToolbar {
        position:fixed;
        z-index:3001;
        height:55px;
        background:#fff;
        border:1px solid rgba(0,0,0,0.06);
        border-radius:8px !important;
        box-shadow:0 2px 16px 0 rgba(0,0,0,0.06);
        display:flex;
        align-items:center;
        transform:translateX(-50%);
    }
    .smm-richTextToolbar-widget .richTextToolbar.isDark {
        background:#363b3f;
    }
    .smm-richTextToolbar-widget .richTextToolbar.isDark .rttBtn {
        color:#fff;
    }
    .smm-richTextToolbar-widget .richTextToolbar.isDark .rttBtn:hover {
        background:hsla(0,0%,100%,0.05);
    }
    .smm-richTextToolbar-widget .richTextToolbar .rttBtn {
        width:55px;
        height:55px;
        display:flex;
        justify-content:center;
        align-items:center;
        cursor:pointer;
    }
    .smm-richTextToolbar-widget .richTextToolbar .rttBtn:hover {
        background-color:#eefbed;
    }
    .smm-richTextToolbar-widget .richTextToolbar .rttBtn.active {
        color:#12bb37;
    }
    .smm-richTextToolbar-widget .richTextToolbar .rttBtn .icon {
        font-size:20px;
    }
    .smm-richTextToolbar-widget .richTextToolbar .rttBtn .icon.fontColor {
        font-size:26px;
    }
    .smm-richTextToolbar-widget .fontOptionsList {
        width:150px;
    }
    .smm-richTextToolbar-widget .fontOptionsList.isDark .fontOptionItem {
        color:#fff;
    }
    .smm-richTextToolbar-widget .fontOptionsList.isDark .fontOptionItem:hover {
        background-color:hsla(0,0%,100%,0.05);
    }
    .smm-richTextToolbar-widget .fontOptionsList .fontOptionItem {
        height:30px;
        width:100%;
        display:flex;
        align-items:center;
        cursor:pointer;
    }
    .smm-richTextToolbar-widget .fontOptionsList .fontOptionItem:hover {
        background-color:#f7f7f7;
    }
    .smm-richTextToolbar-widget .fontOptionsList .fontOptionItem.active {
        color:#12bb37;
    }
    </style>

    <div class="richTextToolbar">
        <div class="rttBtn" id="smmRichTextBoldBtn">
            <span class="icon iconfont bx bx-bold"></span>
        </div>
        <div class="rttBtn" id="smmRichTextItalicBtn">
            <span class="icon iconfont bx bx-italic"></span>
        </div>
        <div class="rttBtn" id="smmRichTextUnderlineBtn">
            <span class="icon iconfont bx bx-underline"></span>
        </div>
        <div class="rttBtn" id="smmRichTextStrikeBtn">
            <span class="icon iconfont bx bx-strikethrough"></span>
        </div>
        <div class="rttBtn" id="smmRichTextRemoveFormatBtn">
            <span class="icon iconfont bx bxs-eraser"></span>
        </div>
    </div>
</div>`;

class RichTextToolbarWidget extends api.BasicWidget {
	constructor(smmRender, config){
        super();
        this.smmRender = smmRender;
        this.mindMap = smmRender.mindMap;
        this.config = config;
        this.showRichTextToolbar = false;
        this.style = {
            left: 200,
            top: 100
        }
        this.fontColor = '';
        this.fontBackgroundColor = '';
        this.formatInfo = {};
	}
    
    doRender() {
        this.$widget = $(TPL);
        this.$richTextToolbar = this.$widget.find('.richTextToolbar');
        this.$richTextToolbar.css(this.style);
        
        this.$boldBtn = this.$richTextToolbar.find('#smmRichTextBoldBtn');
        this.$italicBtn = this.$richTextToolbar.find('#smmRichTextItalicBtn');
        this.$underlineBtn = this.$richTextToolbar.find('#smmRichTextUnderlineBtn');
        this.$strikeBtn = this.$richTextToolbar.find('#smmRichTextStrikeBtn');
        this.$removeFormatBtn = this.$richTextToolbar.find('#smmRichTextRemoveFormatBtn');
        
        this.registerEvent();
        this.toggleShowToolBar();
        return this.$widget;
    }
    
    registerEvent() {
        this.onRichTextSelectionChange = (hasRange, rect, formatInfo) => {
            if (hasRange) {
                this.style.left = rect.left + rect.width / 2 + 'px';
                this.style.top = rect.top - 60 + 'px';
                this.formatInfo = {... (formatInfo || {})}
            }
            this.showRichTextToolbar = hasRange;
            this.toggleShowToolBar();
            this.toggleBtnActive();
        }
        
        this.toggleBold = () => {
            this.setFormatInfo("bold");
            this.mindMap.richText.formatText({
                bold: this.formatInfo.bold
            })
        }
        
        this.toggleItalic = () => {
            this.setFormatInfo("italic");
            this.mindMap.richText.formatText({
                italic: this.formatInfo.italic
            })
        }

        this.toggleUnderline = () => {
            this.setFormatInfo("underline");
            this.mindMap.richText.formatText({
                underline: this.formatInfo.underline
            })
        }

        this.toggleStrike = () => {
            this.setFormatInfo("strike");
            this.mindMap.richText.formatText({
                strike: this.formatInfo.strike
            })
        }
        
        this.removeFormat = () => {
            this.mindMap.richText.removeFormat();
        }
        
        
        this.mindMap.on('rich_text_selection_change', this.onRichTextSelectionChange);
        
        
        this.$boldBtn.on("click", this.toggleBold);
        this.$boldBtn.attr("title", this.config.lang.richTextToolbar.bold);
        
        this.$italicBtn.click(this.toggleItalic);
        this.$italicBtn.attr("title", this.config.lang.richTextToolbar.italic);
        
        this.$underlineBtn.click(this.toggleUnderline);
        this.$underlineBtn.attr("title", this.config.lang.richTextToolbar.underline);
        
        this.$strikeBtn.click(this.toggleStrike);
        this.$strikeBtn.attr("title", this.config.lang.richTextToolbar.strike);
        
        this.$removeFormatBtn.click(this.removeFormat);
        this.$removeFormatBtn.attr("title", this.config.lang.richTextToolbar.removeFormat);
    }
    
    toggleShowToolBar() {
        if (this.showRichTextToolbar) {
            this.$widget.removeClass("hide");
        } else {
            this.$widget.addClass("hide");
        }
        this.$richTextToolbar.css(this.style);
    }
    
    toggleBtnActive() {
        if (this.formatInfo["bold"]) {
            this.$boldBtn.addClass("active");
        } else {
            this.$boldBtn.removeClass("active");
        }
        
        if (this.formatInfo["italic"]) {
            this.$italicBtn.addClass("active");
        } else {
            this.$italicBtn.removeClass("active");
        }
        
        if (this.formatInfo["underline"]) {
            this.$underlineBtn.addClass("active");
        } else {
            this.$underlineBtn.removeClass("active");
        }
        
        if (this.formatInfo["strike"]) {
            this.$strikeBtn.addClass("active");
        } else {
            this.$strikeBtn.removeClass("active");
        }
    }
    
    setFormatInfo(key){
        if (key in this.formatInfo) {
            this.formatInfo[key] = !this.formatInfo[key]
        } else {
            this.formatInfo[key] = true;
        }
        this.toggleBtnActive();
    }
}

module.exports = RichTextToolbarWidget;