const TPL = `
<div class="smm-icon-widget">
    <style>
    .smm-icon-widget .icon-container {
    }
    
    .smm-icon-widget .icon-box .icon-box-item {
        margin-bottom: 20px;
        font-weight: 700;
    }
    
    .smm-icon-widget .icon-box .icon-box-item .icon-title {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }
    
    .smm-icon-widget .icon-list {
        display: flex;
        flex-wrap: wrap;
    }
    
    .smm-icon-widget .icon-list .icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        position: relative;
    }
    
    .smm-icon-widget .icon-list .icon.selected:after {
        content: "";
        position: absolute;
        left: -4px;
        top: -2.5px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #409eff;
        box-sizing: content-box !important;
    }
    
    .smm-icon-widget .icon-list .icon svg{
        width: 100%;
        height: 100%;
    }
    </style>
    <div class="icon-container">
        <div class="icon-box"></div>
    </div>
</div>`;

class SmmIconWidget extends api.BasicWidget {
	constructor(smmRender, iconClickFn){
        super();
        this.smmRender = smmRender;
		this.nodeIconList = smmRender.iconList;
        this.activeName = 'icon';
        this.iconList = [];
        this.activeNodes = smmRender.activeNodes;
	}
    
    doRender() {
        this.$widget = $(TPL);
        this.$iconBox = this.$widget.find('.icon-box');
        this.renderIconBoxItem();
        return this.$widget;
    }
    
    renderIconBoxItem() {
        this.$iconBox.empty();
        for (const item of this.nodeIconList) {
            let $iconBoxItem = $(`<div class="icon-box-item" name="${item.type}"></div>`);
            let $iconTitle = $(`<div class="icon-title">${item.name}</div>`);
            $iconBoxItem.append($iconTitle);
            $iconBoxItem.append(this.renderIconList(item));
            this.$iconBox.append($iconBoxItem);
        }
    }
    
    renderIconList(item) {
        let $iconList = $(`<div class="icon-list"></div>`);
        for (const icon of item.list) {
			const $iconHtml = this.renderIcon(item.type, icon);
			$iconHtml.click(()=>{
				this.setIcon(item.type, icon.name)
			});
            $iconList.append($iconHtml);
        }
        return $iconList;
    }

    renderIcon(type, icon) {
        const $svg = $(this.getHtml(icon.icon));
		const iconHtml = `<div class="icon" name="${type}_${icon.name}"></div>`;
        const $iconHtml = $(iconHtml).append($svg);
        return $iconHtml;
    }
    
    // 获取图标渲染方式
    getHtml(icon) {
        return /^<svg/.test(icon) ? icon : `<img src="${icon}" />`;
    }
    
    setIcon(type, name) {
        this.smmRender.activeNodes.forEach(node => {
            const iconList = [...(node.getData('icon') || [])];
            let key = type + '_' + name;
            let index = iconList.findIndex(item => {
                return item === key;
            })
            // 删除icon
            if (index !== -1) {
                iconList.splice(index, 1);
            } else {
                let typeIndex = iconList.findIndex(item => {
                    return item.split('_')[0] === type;
                })
                // 替换icon
                if (typeIndex !== -1) {
                    iconList.splice(typeIndex, 1, key);
                } else {
                    // 增加icon
                    iconList.push(key);
                }
            }
            node.setIcon(iconList);
            if (this.smmRender.activeNodes.length === 1) {
                this.iconList = iconList;
                this.smmRender.set_icon_selected(iconList);
            }
        })
    }
}

module.exports = SmmIconWidget;