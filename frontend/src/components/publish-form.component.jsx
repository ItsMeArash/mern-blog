import AnimationWrapper from "../common/page-animation.jsx";
import {toast} from "react-hot-toast";
import {useContext} from "react";
import {EditorContext} from "../pages/editor.pages.jsx";
import Tag from "./tags.component.jsx";
import axios from "axios";
import {UserContext} from "../App.jsx";
import {useNavigate, useParams} from "react-router-dom";

const PublishForm = () => {
    const {blog, blog: {banner, title, tags, des, content}, setEditorState, setBlog} = useContext(EditorContext);
    const characterLimit = 200;
    const tagLimit = 10;
    const {userAuth: {accessToken}} = useContext(UserContext);
    const navigate = useNavigate();
    const {blog_id} = useParams();

    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleInputChange = (event) => {
        const input = event.target;

        setBlog({...blog, [input.name]: input.value});
    }

    const handleTitleKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13 || event.keyCode === 188) {
            event.preventDefault();

            const tag = event.target.value;

            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({...blog, tags: [...tags, tag]})
                }
            } else {
                toast.error("Tags count limit reached!")
            }

            event.target.value = '';
        }
    }

    const publishBlog = (event) => {
        if (event.target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write a blog title to publish it!");
        }
        if (!des.length || des.length > characterLimit) {
            return toast.error("Write a proper description!");
        }
        if (!tags.length) {
            return toast.error("Please select at least 1 tag!");
        }

        const loadingToast = toast.loading("Publishing...");
        event.target.classList.add("disable");

        const blogObject = {
            title, banner, des, content, tags, draft: false
        };

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObject, id: blog_id}, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        }).then(() => {
            event.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Published!");

            setTimeout(() => {
                navigate('/');
            }, 500)
        }).catch(({response}) => {
            event.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error)
        })
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                        onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center ">
                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} alt="blog banner" className="overflow-hidden"/>
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-1 ">
                        {title}
                    </h1>

                    <p className="line-clamp-2 text-xl leading-7 mt-4">{des}</p>
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
                              onKeyDown={handleTitleKeyDown}></textarea>
                    <p className="mt-1 text-dark-grey text-sm text-right">{characterLimit - des.length} Characters
                        left</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - (Helps is searching and ranking your blog post)</p>

                    <div className="relative input-box pl-2 py-2 pb-4 ">
                        <input type="text" placeholder="Topics"
                               className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                               onKeyDown={handleKeyDown}/>
                        {
                            tags.map((tag, index) => (
                                <Tag tag={tag} key={index} tagIndex={index}/>
                            ))
                        }
                    </div>
                    <p className="mt-1 mb-4 text-dark-grey text-right">{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8"
                            onClick={publishBlog}>Publish
                    </button>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;