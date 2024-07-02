import AnimationWrapper from "../common/page-animation.jsx";
import {Toaster} from "react-hot-toast";
import {useContext} from "react";
import {EditorContext} from "../pages/editor.pages.jsx";

const PublishForm = () => {
    const {blog, blog: {banner, title, tags, des}, setEditorState, setBlog} = useContext(EditorContext);
    const characterLimit = 200;
    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleInputChange = (event) => {
        const input = event.target;

        setBlog({...blog, [input.name]: input.value});
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster/>
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                        onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center ">
                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} alt="blog banner"/>
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-1 ">
                        {title}
                    </h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input type="text"
                           onChange={handleInputChange}
                           placeholder="Blog Title"
                           name="title"
                           defaultValue={title}
                           className="input-box pl-4 placeholder:opacity-50"/>

                    <p className="text-dark-grey mb-2 mt-9">Short description about your blog</p>
                    <textarea maxLength={characterLimit}
                              defaultValue={des}
                              name="des"
                              className="h-40 resize-none leading-7 input-box pl-4 "
                              onChange={handleInputChange}
                    onKeyDown={handleKeyDown}></textarea>
                    <p className="mt-1 text-dark-grey text-sm text-right">{characterLimit - des.length} Characters left</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - (Helps is searching and ranking your blog post)</p>

                    <div className="relative input-box pl-2 py-2 pb-4 ">
                        <input type="text" placeholder="Topics" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3"/>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;