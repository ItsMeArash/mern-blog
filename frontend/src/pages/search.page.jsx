import {useParams} from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component.jsx";
import Loader from "../components/loader.component.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import {filterPaginationData} from "../common/filter-pagination-data.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";

const SearchPage = () => {
    const [blogs, setBlogs] = useState(null);
    const {query} = useParams();

    const searchBlogs = ({page = 1, create_new_arr = false}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {query, page})
            .then(async ({data}) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page: page,
                    countRoute: "/search-blogs-count",
                    data_to_send: {query},
                    create_new_arr,
                });
                setBlogs(formattedData);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const resetStates = () => {
        setBlogs(null);
    }

    useEffect(() => {
        resetStates();
        searchBlogs({page: 1, create_new_arr: true});
    }, [query]);

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search results for ${query}`, "Accounts matched"]}
                                  defaultHidden={["Accounts matched"]}>
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
                        <LoadMoreDataBtn state={blogs} fetchData={searchBlogs}/>
                    </>
                </InPageNavigation>
            </div>
        </section>
    )
}

export default SearchPage;