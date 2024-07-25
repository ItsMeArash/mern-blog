import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation, {activeTabRef} from "../components/inpage-navigation.component.jsx";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../components/loader.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import MinimalBlogPost from "../components/nobanner-blog-post.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import {filterPaginationData} from "../common/filter-pagination-data.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";

const HomePage = () => {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [pageState, setPageState] = useState("home");

    const categories = ["programming", "hollywood", "film making", "social media", "cooking", "tech", "finance", "travel"];

    const fetchLatestBlogs = ({page = 1}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", {page})
            .then(async ({data}) => {
                console.log(data.blogs)
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page: page,
                    countRoute: "/all-latest-blogs-count"
                });

                console.log(formattedData);
                setBlogs(formattedData);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const fetchBlogsByCategory = ({page = 1}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {tag: pageState, page})
            .then(async ({data}) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page: page,
                    countRoute: "/search-blogs-count",
                    data_to_send: {tag: pageState}
                });

                console.log(formattedData);
                setBlogs(formattedData);
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

    const loadBlogByCategory = (event) => {
        const category = event.target.innerText.toLowerCase();
        setBlogs(null);
        if (pageState === category) {
            setPageState("home");
            return;
        }
        setPageState(category);
    }

    useEffect(() => {
        activeTabRef.current.click();

        if (pageState === "home") {
            fetchLatestBlogs({page: 1});
        } else {
            fetchBlogsByCategory({page: 1});
        }
        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

    }, [pageState]);

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/*Latest blogs*/}
                <div className="w-full">
                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                            {
                                blogs === null ? <Loader/> : (
                                    blogs.results.length ? (
                                        blogs.results.map((blog, index) => (
                                            <AnimationWrapper key={index}
                                                              transition={{duration: 1, delay: index * 0.1}}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info}/>
                                            </AnimationWrapper>
                                        ))
                                    ) : (
                                        <NoDataMessage message="No Blogs published!"/>
                                    )

                                )
                            }
                            <LoadMoreDataBtn state={blogs} fetchData={(pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory)}/>
                        </>
                        {
                            trendingBlogs === null ? <Loader/> : (
                                trendingBlogs.length ? (
                                    trendingBlogs?.map((blog, index) => (
                                        <AnimationWrapper key={index} transition={{duration: 1, delay: index * 0.1}}>
                                            <MinimalBlogPost blog={blog} index={index}/>
                                        </AnimationWrapper>
                                    ))
                                ) : (
                                    <NoDataMessage message="No trending blogs!"/>
                                )
                            )
                        }
                    </InPageNavigation>
                </div>
                {/*Filters and trending blogs*/}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
                            <div className="flex gap-2 flex-wrap">
                                {
                                    categories.map((category, index) => (
                                        <button key={index}
                                                className={`tag ${pageState === category && "bg-black text-white"}`}
                                                onClick={loadBlogByCategory}>
                                            {category}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Trending
                                <i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>
                            {
                                trendingBlogs === null ? <Loader/> : (
                                    trendingBlogs.length ? (
                                        trendingBlogs?.map((blog, index) => (
                                            <AnimationWrapper key={index}
                                                              transition={{duration: 1, delay: index * 0.1}}>
                                                <MinimalBlogPost blog={blog} index={index}/>
                                            </AnimationWrapper>
                                        ))
                                    ) : (
                                        <NoDataMessage message="No trending blogs!"/>
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;