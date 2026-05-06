export default function DeleteConfirmDialog({ open, noteTitle, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="modal d-block" style={{ backgroundColor:'rgba(0,0,0,0.45)', zIndex:1060 }} onClick={onCancel}>
            <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e=>e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0"><h6 className="modal-title fw-bold">Delete note?</h6></div>
                    <div className="modal-body pt-1">
                        <p className="text-muted small mb-0">
                            {noteTitle ? <>Are you sure you want to delete <strong>"{noteTitle}"</strong>? This cannot be undone.</> : 'Are you sure? This cannot be undone.'}
                        </p>
                    </div>
                    <div className="modal-footer border-0 pt-0 gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
                        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
