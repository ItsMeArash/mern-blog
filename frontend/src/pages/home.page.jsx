import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import MinimalBlogPost from "../components/nobanner-blog-post.component.jsx";

const HomePage = () => {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
            .then((response) => {
                setBlogs(response.data.blogs);
            })
            .catch(err => {
                console.log(err);
            })
    }
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then((response) => {
                setTrendingBlogs(response.data.blogs);
            })
            .catch(err => {
                console.log(err);
            })
    }

    useEffect(() => {
        fetchLatestBlogs();
        fetchTrendingBlogs();
    }, []);

    useEffect(() => {
        console.log(blogs)
    }, [blogs]);

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/*Latest blogs*/}
                <div className="w-full">
                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                            {
                                blogs === null ? <Loader/> : (
                                    blogs?.map((blog, index) => (
                                        <AnimationWrapper key={index} transition={{duration: 1, delay: index * 0.1}}>
                                            <BlogPostCard content={blog} author={blog.author.personal_info}/>
                                        </AnimationWrapper>
                                    ))
                                )
                            }
                        </>
                        {
                            trendingBlogs === null ? <Loader/> : (
                                trendingBlogs?.map((blog, index) => (
                                    <AnimationWrapper key={index} transition={{duration: 1, delay: index * 0.1}}>
                                        <MinimalBlogPost blog={blog} index={index}/>
                                    </AnimationWrapper>
                                ))
                            )
                        }
                    </InPageNavigation>
                </div>
                {/*Filters and trending blogs*/}
                <div className="">

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;