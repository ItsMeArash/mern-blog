import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import {Navigate} from "react-router-dom";
import BlogEditor from "../components/blog-editor.component.jsx";
import PublishForm from "../components/publish-form.component.jsx";

const Editor = () => {
    const [editorState, setEditorState] = useState("editor");

    const {userAuth: {accessToken}} = useContext(UserContext)
    return (
        !accessToken ? <Navigate to="/signin"/> : (
            editorState === "editor" ? <BlogEditor/> : <PublishForm/>
        )
    )
}

export default Editor;