import {createContext, useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation.jsx";
import Loader from "../components/loader.component.jsx";
import {getDay} from "../common/date.jsx";
import BlogInteraction from "../components/blog-interaction.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import BlogContent from "../components/blog-content.component.jsx";
import CommentsContainer, {fetchComments} from "../components/comments.component.jsx";

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {personal_info: {}},
    banner: '',
    publishedAt: ''
};

export const BlogContext = createContext({});

const BlogPage = () => {
    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLikedByUser, setIsLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const {blog_id} = useParams();

    const {
        title,
        content,
        banner,
        author: {personal_info: {fullname, username: author_username, profile_img}},
        publishedAt
    } = blog;

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    };

    useEffect(() => {
        resetStates()
        fetchBlog();
    }, [blog_id]);

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {blog_id})
            .then(async ({data: {blog}}) => {
                blog.comments = await fetchComments({
                    blog_id: blog._id,
                    setParentCommentsCount: setTotalParentCommentsLoaded
                })
                setBlog(blog);
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
                    tag: blog.tags[0],
                    limit: 6,
                    eliminate_blog: blog_id
                })
                    .then(({data}) => {
                        setSimilarBlogs(data.blogs);
                    })
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
                    <BlogContext.Provider value={{
                        blog,
                        setBlog,
                        isLikedByUser,
                        setIsLikedByUser,
                        commentsWrapper,
                        setCommentsWrapper,
                        totalParentCommentsLoaded,
                        setTotalParentCommentsLoaded
                    }}>
                        <CommentsContainer/>
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
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published
                                        on {getDay(publishedAt)}</p>
                                </div>
                            </div>
                            <BlogInteraction/>

                            <div className="my-12 blog-page-content">
                                {
                                    content[0].blocks.map((block, index) => {
                                        return (
                                            <div key={index} className="my-4 md:my-8">
                                                <BlogContent block={block}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            <BlogInteraction/>
                            {
                                similarBlogs?.length && (
                                    <>
                                        <h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>
                                        {
                                            similarBlogs.map((blog, index) => {
                                                const {author: {personal_info}} = blog;

                                                return (
                                                    <AnimationWrapper key={index}
                                                                      transition={{duration: 1, delay: index * 0.08}}>
                                                        <BlogPostCard content={blog} author={personal_info}/>
                                                    </AnimationWrapper>
                                                )
                                            })
                                        }
                                    </>
                                )
                            }
                        </div>
                    </BlogContext.Provider>
                )
            }
        </AnimationWrapper>
    );
};

export default BlogPage;