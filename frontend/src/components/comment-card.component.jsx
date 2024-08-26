import {getDay} from "../common/date.jsx";
import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import CommentField from "./comment-field.component.jsx";
import {BlogContext} from "../pages/blog.page.jsx";
import axios from "axios";

const CommentCard = ({index, leftValue, commentData}) => {
    const [isReplying, setIsReplying] = useState(false);
    const {
        commented_by: {personal_info: {profile_img, fullname, username}},
        commentedAt,
        comment,
        _id,
        children
    } = commentData;
    const {userAuth: {accessToken}} = useContext(UserContext);
    const {blog, blog: {comments, comments: {results: commentsArray}}, setBlog} = useContext(BlogContext);
    const handleReply = () => {
        if (!accessToken) {
            return toast.error('Login first to leave a reply');
        }
        setIsReplying(prev => !prev);
    };

    const removeCommentsCards = (startingPoint) => {
        if (commentsArray[startingPoint]) {
            while (commentsArray[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArray.splice(startingPoint, 1);
                if (!commentsArray[startingPoint]) {
                    break;
                }
            }
        }
        setBlog({...blog, comments: {results: commentsArray}})
    };
    const hideReplies = () => {
        commentData.isReplyLoaded = false;

        removeCommentsCards(index + 1);
    };

    const loadReplies = ({skip = 0}) => {
        if (children.length) {
            hideReplies();

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {_id, skip})
                .then(({data: {replies}}) => {
                    commentData.isReplyLoaded = true;

                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentData.childrenLevel + 1;
                        commentsArray.splice(index + 1 + i + skip, 0, replies[i]);
                    }
                    setBlog({...blog, comments: {...comments, results: commentsArray}})
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };

    return (
        <div className="w-full" style={{paddingLeft: `${leftValue * 10}px`}}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} alt="user avatar" className="rounded-full w-6 h-6"/>
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>
                <p className="text-xl ml-3">{comment}</p>
                <div className="flex gap-5 items-center mt-5">
                    {
                        commentData.isReplyLoaded ? (
                            <button onClick={hideReplies}
                                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">
                                <i className="fi fi-rs-comment-dots"></i>Hide reply
                            </button>
                        ) : (
                            <button onClick={loadReplies}
                                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">
                                <i className="fi fi-rs-comment-dots"></i>{children.length} Replies
                            </button>
                        )
                    }
                    <button className="underline underline-offset-4"
                            onClick={handleReply}>
                        Reply
                    </button>
                </div>
                {
                    isReplying && (
                        <div className="mt-8">
                            <CommentField action="reply"
                                          index={index}
                                          replyingTo={_id}
                                          setIsReplying={setIsReplying}/>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default CommentCard;