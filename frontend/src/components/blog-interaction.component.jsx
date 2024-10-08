import React, {useContext, useEffect} from 'react';
import {BlogContext} from "../pages/blog.page";
import {Link} from "react-router-dom";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
    let {
        blog,
        blog: {
            _id,
            title,
            blog_id,
            activity,
            activity: {total_likes, total_comments},
            author: {personal_info: {username: author_username}}
        },
        setBlog,
        isLikedByUser,
        setIsLikedByUser,
        setCommentsWrapper
    } = useContext(BlogContext);
    const {userAuth: {username, accessToken}} = useContext(UserContext);

    useEffect(() => {
        if (accessToken) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isLiked-by-user", {_id}, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
                .then(({data: {result}}) => {
                    setIsLikedByUser(Boolean(result));
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }, []);

    const handleLike = () => {
        if (accessToken) {
            setIsLikedByUser(prev => !prev);
            !isLikedByUser ? total_likes++ : total_likes--;
            setBlog({...blog, activity: {...activity, total_likes}});

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", {_id, isLikedByUser}, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
                .then(() => {
                    // console.log(data)
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            toast.error("Please login to like the blog!")
        }
    };

    return (
        <>
            <hr className="border-grey my-2"/>
            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + (isLikedByUser ? "hover:bg-red/20 text-red" : "hover:bg-grey/80")}
                        onClick={handleLike}>
                        <i className={`fi fi-${isLikedByUser ? 's' : 'r'}r-heart`}></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-grey/80"
                            onClick={() => setCommentsWrapper(prev => !prev)}>
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>
                </div>
                <div className="flex gap-6 items-center">
                    {
                        username === author_username &&
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link>
                    }
                    <Link to={`https://x.com/intent/post?text=Read ${title}&url=${location.href}`}>
                        <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
                    </Link>
                </div>
            </div>
            <hr className="border-grey my-2"/>
        </>
    );
};

export default BlogInteraction;