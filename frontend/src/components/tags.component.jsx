import {useContext} from "react";
import {EditorContext} from "../pages/editor.pages.jsx";

const Tag = ({tag, tagIndex}) => {
    const {blog, blog: {tags}, setBlog} = useContext(EditorContext);

    const addEditable = (event) => {
        event.target.setAttribute("contentEditable", true);
        event.target.focus();
    }

    const deleteTag = (event) => {
        const newTags = tags.filter(t => t !== tag);
        setBlog({...blog, tags: newTags});
    }

    const editTag = (event) => {
        if (event.keyCode === 13 || event.keyCode === 188) {
            event.preventDefault();
            tags[tagIndex] = event.target.innerText;
            setBlog({...blog, tags})
            event.target.removeAttribute("contentEditable")
        }
    }

    return (
        <div className="relative p-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
            <p className="outline-none" onKeyDown={editTag} onClick={addEditable}>{tag}</p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2 "
                    onClick={deleteTag}>
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    )
}

export default Tag;