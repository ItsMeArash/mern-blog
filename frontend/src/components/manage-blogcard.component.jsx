import {Link} from "react-router-dom";
import {getDay} from "../common/date.jsx";
import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import axios from "axios";

export const ManagePublishedBlogCard = ({blog}) => {
    const {banner, blog_id, title, publishedAt, activity} = blog;
    const {userAuth: {accessToken}} = useContext(UserContext);
    const [showStats, setShowStats] = useState(false);

    const toggleStats = () => {
        setShowStats(prev => !prev);
    };

    return (
        <>
            <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
                <img src={banner}
                     alt="banner"
                     className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover"/>
                <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
                    <div>
                        <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">{title}</Link>
                        <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
                    </div>
                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
                        <button className="lg:hidden pr-4 py-2 underline" onClick={toggleStats}>Stats</button>
                        <button className="pr-4 py-2 underline text-red"
                                onClick={(event) => deleteBlog(blog, accessToken, event.target)}>
                            Delete
                        </button>
                    </div>
                </div>
                <div className="max-lg:hidden">
                    <BlogStats stats={activity}/>
                </div>
            </div>
            {
                showStats && (
                    <div className="lg:hidden">
                        <BlogStats stats={activity}/>
                    </div>
                )
            }
        </>
    );
};

export const ManageDraftBlogPost = ({blog}) => {
    let {title, des, blog_id, index} = blog;
    const {userAuth: {accessToken}} = useContext(UserContext);
    index++;

    return (
        <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
            <h1 className="blog-index text-center pl-4 md:pl-6 flex-none ">
                {index < 10 ? '0' + index : index}
            </h1>
            <div>
                <h1 className="blog-title mb-3">{title}</h1>
                <p className="line-clamp-2">{des.length ? des : "No description"}</p>
                <div className="flex gap-6 mt-3">
                    <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>

                    <button className="pr-4 py-2 underline text-red"
                            onClick={(event) => deleteBlog(blog, accessToken, event.target)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const BlogStats = ({stats}) => {
    return (
        <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
            {
                Object.keys(stats).map((key, index) => {
                    return !key.includes("parent") ? (
                        <div
                            className={"flex flex-col items-center w-full h-full justify-center p-4 px-6" + (index !== 0 ? " border-grey border-l " : '')}
                            key={index}>
                            <h1 className="text-xl lg:text-2xl mb-2">{stats[key].toLocaleString()}</h1>
                            <p className="max-lg:text-dark-grey capitalize">{key.split('_')[1]}</p>
                        </div>
                    ) : '';
                })
            }
        </div>
    );
};

const deleteBlog = (blog, accessToken, target) => {
    const {index, blog_id, setStateFunction} = blog;

    target.setAttribute("disabled", true);
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog", {blog_id}, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(({data}) => {
            target.removeAttribute("disabled");
            setStateFunction(prev => {
                let {deletedDocCount, totalDocs, results} = prev;
                results.splice(index, 1);

                if (!deletedDocCount) {
                    deletedDocCount = 0;
                }

                if (!results.length && totalDocs - 1 > 0) {
                    return null;
                }

                return {...prev, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1};
            });
        })
        .catch(err => {
            console.log(err);
        });
};