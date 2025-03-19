## trilium-simple-mind-map
### 预览
![image](https://github.com/user-attachments/assets/292b6fbc-353f-418c-9142-f55f7228bb57)


Powered by [simple-mind-map](https://github.com/wanglin2/mind-map)（[Trilium](https://github.com/zadam/trilium) 0.63.7）

*注意*：请勿在网络不通畅时编辑思维导图笔记，请及时使用trilium的【保存笔记历史】功能对思维导图笔记进行备份，以防数据丢失。
### 结构
1. TriliumSmmWidget：将插件渲染到note-detail-pane
2. SmmRender：用于smm功能的调用和页面渲染
3. QuickSearchWidget：提取自trilium源码，快速搜索笔记并获取选中笔记的链接地址和名称
4. CopyImageReferenceButton：提取自trilium源码，可以根据searchString复制图像引用到剪切板
5. SmmLinkRender：在超链接笔记的预览提示框中，渲染思维导图
6. SmmTextNoteRenderWidget：在text笔记中渲染思维导图，还有些问题，但不影响使用
### 安装
1. 导入笔记，取消勾选安全导入选项（如果您不熟悉trilium的小部件，请谨慎操作）
2. 重新加载页面，开始使用
### 更新
1. 导入笔记
2. 如果需要保留之前的模板关系，可以保留旧版本的【模板】中的【simple-mind-map】笔记，然后复制新导入的【simple-mind-map】笔记的属性（关系和标签）和内容替换旧版本
3. 旧版本中【simple-mind-map】笔记包含的模板数据可按需保留或修改，其余笔记或数据删除不影响插件，如果确认已经不再需要旧版本，可以进行删除
### 使用
#### 如何新建思维导图笔记
1. 在插入子笔记的菜单中可以看到simple-mind-map选项，参考[Template · zadam/trilium Wiki](https://github.com/zadam/trilium/wiki/Template#instance-note)
#### 如何自定义主题
1. 参考【customThemeList】笔记进行配置
2. 获取更多主题可以查看主题扩展插件[simple-mind-map-plugin-themes](https://github.com/wanglin2/simple-mind-map-plugin-themes)
3. 自定义主题在【SmmLinkRender】插件中自动渲染为classic4主题
#### 如何切换语言
1. 在【config】笔记中修改LANGUAGE变量即可更换语言，目前支持zh_cn、en_us两个选项
#### 如何在分享页面渲染思维导图
1. 【share_page.ejs】打开分享笔记选项
2. 在【simple-mind-map】模板笔记添加关系 ~shareTemplate=share_page.ejs，并打开分享笔记选项
3. 针对单个思维导图笔记进行渲染可为笔记单独添加关系 ~shareTemplate=share_page.ejs
4. 注意此处的share_page.ejs为笔记链接不是文字
5. 如果使用了其他的shareTemplate请参考【share_page.ejs】的54-114行自行修改
#### 如何避免数据丢失
1. 请勿在网络不通畅时编辑思维导图笔记，该行为可能会导致数据丢失，请在编辑思维导图后及时使用trilium的【保存笔记历史】功能对思维导图笔记进行备份，以防数据丢失
2. 若已使用【保存笔记历史】功能，出现数据丢失后，可在【笔记修改历史】中恢复历史笔记数据
### 更新计划
1. 已无更新计划，如果您有功能需求，可以在issue中提出