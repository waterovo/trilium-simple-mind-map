//@ts-nocheck
import './style.css'
import MindMap from "simple-mind-map"
import Themes from 'simple-mind-map-plugin-themes'
import { FrontendAPI } from "trilium/frontend";

// declare const api: FrontendAPI;

/**
 * 1. mindMap, 
 */

// 注册主题
Themes.init(MindMap)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="mindMapContainer"></div>
`

const mindMap = new MindMap({
  el: document.querySelector<HTMLDivElement>('#mindMapContainer') as HTMLDivElement,
  theme: 'dark7',
  data: {
    "data": {
        "text": "根节点"
    },
    "children": []
  }
});


