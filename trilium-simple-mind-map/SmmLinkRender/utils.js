async function getData(noteId) {
    const data = await api.runOnBackend((noteId) => {
        const note = api.searchForNote(`#SimpleMindMap and note.noteId="${noteId}"`);
        if(note!==null){
            return note.getContent();
        }else{
            return null;
        }
    }, [noteId]);
    return data;
}

module.exports = {
    getData
}