import { Config } from "../config";
import { Context } from "../context";
import i18n from "../i18n";

export default class BaseWidget {
    context: Context;
    mindMap: any;
    config: Config;
    $widget: JQuery<HTMLElement>;
    i18n: i18n;

  
    constructor(opt?:{}){
        
    }

    get renderOn(){
        return "components"
    }

    doRender():JQuery<HTMLElement> {
        this.$widget = $("")
        return this.$widget
    }

    registerEvent() {
        
    }
}