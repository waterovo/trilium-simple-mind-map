import ejs from "ejs"

const TPL = `
<div class="smm-backdrops-container">
    <div class="modal fade" id="imageBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="imageBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="imageBackdropLabel"><%= backdrops.imageOnTitle %></h5>
                    <button type="button" class="close" data-dismiss="modal" data-bs-dismiss="modal" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="input-group input-group-sm mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><%= backdrops.imageUrl %></span>
                        </div>
                        <input name="imageUrlContent" type="text" class="form-control" placeholder="<%= backdrops.imageUrlPlaceholder %>" />
                    </div>
                    <div class="input-group input-group-sm mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><%= backdrops.imageTitle %></span>
                        </div>
                        <input name="imageTitleContent" type="text" class="form-control" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-dismiss="modal" data-bs-dismiss="modal"><%= backdrops.close %></button>
                    <button type="button" id="imageSave" class="btn btn-primary"><%= backdrops.save %></button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="urlLinkBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="urlLinkBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="urlLinkBackdropLabel"><%= backdrops.linkOnTitle %></h5>
                    <button type="button" class="close" data-dismiss="modal" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-dismiss="modal" data-bs-dismiss="modal"><%= backdrops.close %></button>
                    <button type="button" id="urlLinkSave" class="btn btn-primary"><%= backdrops.save %></button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="remarkBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="remarkBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="remarkBackdropLabel"><%= backdrops.remarkOnTitle %></h5>
                    <button type="button" class="close" data-dismiss="modal" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="input-group mb-3">
                        <textarea class="form-control" name="remarkContent" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-dismiss="modal" data-bs-dismiss="modal"><%= backdrops.close %></button>
                    <button type="button" id="remarkSave" class="btn btn-primary"><%= backdrops.save %></button>
                </div>
            </div>
        </div>
    </div>
    
    <div class="modal fade" id="iconListBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="iconListBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="iconListBackdropLabel"><%= backdrops.iconOnTitle %></h5>
                    <button type="button" class="close" data-dismiss="modal" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-dismiss="modal" data-bs-dismiss="modal"><%= backdrops.close %></button>
                </div>
            </div>
        </div>
    </div>
</div>`

export default function renderBackdropsTpl (data:{}){
    return ejs.render(TPL, data, {async:false}) as string
}