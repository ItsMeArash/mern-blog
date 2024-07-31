import {createContext, useState} from "react";
import BlogEditor from "../components/blog-editor.component.jsx";
import PublishForm from "../components/publish-form.component.jsx";

const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: {personal_info: {}},
};

export const EditorContext = createContext({});

const Editor = () => {
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({isReady: false});

    return (
        <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState, textEditor, setTextEditor}}>
            {
                editorState === "editor" ? <BlogEditor/> : <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor;