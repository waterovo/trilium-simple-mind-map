import translation from "./language/translation"

export default class {
    lang: string

    constructor(lang: string){
        this.lang = lang
    }

    t(position: string, key :string):string {
        return translation[this.lang][position][key]
    }

    p(position: string):string {
        return translation[this.lang][position]
    }
}