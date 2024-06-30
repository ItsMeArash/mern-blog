import {Link} from "react-router-dom";
import AnimationWrapper from "../common/page-animation.jsx";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png"
import {uploadImage} from "../common/aws.jsx";
import {useRef} from "react";

const BlogEditor = () => {
    const blogBannerRef = useRef();
    const handleBannerUpload = (event) => {
        const image = event.target.files[0]
        if (image) {
            uploadImage(image).then(url => {
                if (url) {
                    blogBannerRef.current.src = url;
                }
            });
        }
    }
    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="logo"/>
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">New Blog</p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2">Publish</button>
                    <button className="btn-light py-2">Save Draft</button>
                </div>
            </nav>

            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="related aspect-video bg-white border-4 border-grey hover:opacity-80">
                            <label htmlFor="uploadBanner">
                                <img src={defaultBanner} ref={blogBannerRef} alt="blog banner" className="z-20"/>
                                <input id="uploadBanner" type="file" accept=".png, .jpg, .jpeg" hidden
                                       onChange={handleBannerUpload}/>
                            </label>
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;