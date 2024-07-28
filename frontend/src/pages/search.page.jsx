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
import UserCard from "../components/usercard.component.jsx";

const SearchPage = () => {
    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);
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
        setUsers(null);
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", {query})
            .then(({data: {users}}) => {
                setUsers(users);
            })
    }

    useEffect(() => {
        resetStates();
        searchBlogs({page: 1, create_new_arr: true});
        fetchUsers();
    }, [query]);

    const UserCardWrapper = () => (
        <>
            {
                users === null ? <Loader/> : (
                    users.length ?
                        users.map((user, index) => (
                            <AnimationWrapper key={index} transition={{duration: 1, delay: index * 0.08}}>
                                <UserCard user={user}/>
                            </AnimationWrapper>
                        )) :
                        <NoDataMessage message="No users found!"/>
                )
            }
        </>
    )

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
                    <UserCardWrapper/>
                </InPageNavigation>
            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">Users related to search <i className="fi fi-rr-user mt-1"></i></h1>
                <UserCardWrapper/>
            </div>
        </section>
    )
}

export default SearchPage;