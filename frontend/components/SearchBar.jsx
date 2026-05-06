import { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
export default function SearchBar() {
    const { search, searchQuery } = useNotes();
    const [val, setVal] = useState(searchQuery);
    const timer = useRef(null);
    const onChange = e => { const q=e.target.value; setVal(q); clearTimeout(timer.current); timer.current=setTimeout(()=>search(q),300); };
    const clear = () => { setVal(''); clearTimeout(timer.current); search(''); };
    useEffect(()=>()=>clearTimeout(timer.current),[]);
    return (
        <div className="input-group" style={{maxWidth:400}}>
            <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
            <input type="search" className="form-control border-start-0 border-end-0 shadow-none" placeholder="Search notes…" value={val} onChange={onChange} style={{outline:'none',boxShadow:'none'}}/>
            {val && <button className="btn btn-outline-secondary border-start-0" onClick={clear} type="button">✕</button>}
        </div>
    );
}
