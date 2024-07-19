const TPL = `
<button type="button"
        class="copy-image-reference-button"
        title="复制图像引用到剪贴板, 可以粘贴到文本笔记中.">
        <span class="bx bx-copy"></span>
        
        <div class="hidden-image-copy"></div>
</button>`;

class CopyImageReferenceButton extends api.NoteContextAwareWidget {
    static get parentWidget() {
        return "note-detail-pane";
    }
    isEnabled() {
        return super.isEnabled()
            && this.note.type === 'code' 
            && this.note.mime==="application/json" 
            && this.note.hasLabel(config.NOTE_LABEL)
            && this.note.isContentAvailable()
            && this.noteContext?.viewScope.viewMode === 'default';
    }

    doRender() {
        super.doRender();

        this.$widget = $(TPL);
        this.$hiddenImageCopy = this.$widget.find(".hidden-image-copy");
        this.moveFlag = false;

        this.$widget.on('click', () => {
            let searchString = `#${config.NOTE_LABEL_ATTACHMENT} AND note.parents.noteId='${this.note.noteId}' AND note.title=*'${config.IMAGE_NOTE_TITLE}' orderBy note.dateModified desc`;
            utils.getImageNote(searchString).then((res) => {
                if(!res){
                    api.showMessage("复制图像引用失败，请先保存图像附件！");
                    return;
                }
                this.$hiddenImageCopy.empty().append(
                    $("<img>").attr("src", utils.createImageSrcUrl(res.noteId, res.title))
                );

                utils.copyImageReferenceToClipboard(this.$hiddenImageCopy);
                api.showMessage("记得保存图像附件，以保持图像引用最新！");
                this.$hiddenImageCopy.empty();
            });
        });
        /*
        this.$widget.on('click', () => {
            utils.getImageAttachment(this.note.noteId, config.IMAGE_NOTE_TITLE).then((res) => {
                if(!res){
                    api.showMessage("复制图像引用失败，请先保存图像附件！");
                    return;
                }
                this.$hiddenImageCopy.empty().append(
                    $("<img>").attr("src", utils.createImageAttachmentSrcUrl(res.attachmentId, res.title))
                );

                utils.copyImageReferenceToClipboard(this.$hiddenImageCopy);
                api.showMessage("记得保存图像附件，以保持图像引用最新！");
                this.$hiddenImageCopy.empty();
            });
        });
        */
        this.contentSized();
    }
    
    async refreshWithNote(note) {
        if(!this.moveFlag){
            this.$widget.prependTo(this.$widget.parent().find('.floating-buttons-children'));
            this.moveFlag = true;
        }
    }
}

module.exports = CopyImageReferenceButton;