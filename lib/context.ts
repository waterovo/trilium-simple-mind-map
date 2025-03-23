import { Config } from "./config";
import { Note } from "trilium/frontend"

export interface Context {
    widget: JQuery<HTMLElement>,
    config: Config,
    note: Note
}