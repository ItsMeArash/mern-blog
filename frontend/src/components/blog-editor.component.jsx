import {Link} from "react-router-dom";
import AnimationWrapper from "../common/page-animation.jsx";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png"
import {uploadImage} from "../common/aws.jsx";
import {useContext, useEffect, useRef} from "react";
import {Toaster, toast} from "react-hot-toast";
import {EditorContext} from "../pages/editor.pages.jsx";
import EditorJS from "@editorjs/editorjs";

const BlogEditor = () => {
    const {blog, blog: {title, banner, content, tags, description}, setBlog} = useContext(EditorContext);

    useEffect(() => {
        const editor = new EditorJS({
            holder: "textEditor",
            data: '',
            placeholder: "Let's write an awesome story..."
        });
    }, []);

    const handleTitleKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    const handleTitleChange = (event) => {
        const input = event.target;

        input.style.height = "auto"
        input.style.height = `${input.scrollHeight}px`;

        setBlog({...blog, title: input.value})
    }

    const handleBannerUpload = (event) => {
        const image = event.target.files[0];
        if (image) {
            let loadingToast = toast.loading('Uploading...');
            uploadImage(image).then(url => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded!👍")
                    setBlog({...blog, banner: url});
                }
            }).catch((err) => {
                toast.dismiss(loadingToast);
                return toast.error(err)
            });
        }
    }
    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="logo"/>
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title || "New Blog"}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2">Publish</button>
                    <button className="btn-light py-2">Save Draft</button>
                </div>
            </nav>
            <Toaster/>
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="related aspect-video bg-white border-4 border-grey hover:opacity-80 cursor-pointer">
                            <label htmlFor="uploadBanner">
                                <img src={banner || defaultBanner} alt="blog banner" className="z-20"/>
                                <input id="uploadBanner" type="file" accept=".png, .jpg, .jpeg" hidden
                                       onChange={handleBannerUpload}/>
                            </label>
                        </div>
                        <textarea placeholder="Blog Title"
                                  className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                                  onKeyDown={handleTitleKeyDown}
                                  onChange={handleTitleChange}>
                        </textarea>

                        <hr className="w-full opacity-10 my-5"/>

                        <div id="textEditor" className="font-gelasio">

                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;