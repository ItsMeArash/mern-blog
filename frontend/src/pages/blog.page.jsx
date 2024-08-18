import {createContext, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation.jsx";
import Loader from "../components/loader.component.jsx";
import {getDay} from "../common/date.jsx";
import BlogInteraction from "../components/blog-interaction.component.jsx";

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    tags: [],
    author: {personal_info: {}},
    banner: '',
    publishedAt: ''
};

export const BlogContext = createContext({});

const BlogPage = () => {
    const [blog, setBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const {blog_id} = useParams();

    const {title, content, banner, author: {personal_info: {fullname, username: author_username, profile_img}}, publishedAt} = blog;

    useEffect(() => {
        fetchBlog();
    }, []);

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {blog_id})
            .then(({data: {blog}}) => {
                setBlog(blog);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            });
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader/> : (
                    <BlogContext.Provider value={{blog, setBlog}}>
                        <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                            <img src={banner} alt="blog banner" className="aspect-video"/>
                            <div className="mt-12">
                                <h2>{title}</h2>
                                <div className="flex max-sm:flex-col justify-between my-8">
                                    <div className="flex gap-5 items-start">
                                        <img src={profile_img} alt="user avatar" className="h-12 w-12 rounded-full"/>

                                        <p>
                                            {fullname}
                                            <br/>
                                            @
                                            <Link to={`/user/${author_username}`}
                                                  className="underline">
                                                {author_username}
                                            </Link>
                                        </p>
                                    </div>
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                                </div>
                            </div>
                            <BlogInteraction/>
                        </div>
                    </BlogContext.Provider>
                )
            }
        </AnimationWrapper>
    );
};

export default BlogPage;