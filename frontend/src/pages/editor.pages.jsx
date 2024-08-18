import {createContext, useEffect, useState} from "react";
import BlogEditor from "../components/blog-editor.component.jsx";
import PublishForm from "../components/publish-form.component.jsx";
import {useParams} from "react-router-dom";
import Loader from "../components/loader.component.jsx";
import axios from "axios";

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
    const {blog_id} = useParams();

    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({isReady: false});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!blog_id) {
            return setLoading(false);
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {blog_id, draft: true, mode: "edit"})
            .then(({data: {blog}}) => {
                setBlog(blog);
                setLoading(false);
            })
            .catch(() => {
                setBlog(null);
                setLoading(false);
            })
    }, []);

    return (
        <EditorContext.Provider value={{blog, setBlog, editorState, setEditorState, textEditor, setTextEditor}}>
            {
                loading ? <Loader/> :
                    editorState === "editor" ? <BlogEditor/> : <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor;