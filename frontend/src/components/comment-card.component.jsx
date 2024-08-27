import {useContext, useState} from "react";
import {getDay} from "../common/date.jsx";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import CommentField from "./comment-field.component.jsx";
import {BlogContext} from "../pages/blog.page.jsx";
import axios from "axios";

const CommentCard = ({index, leftValue, commentData}) => {
    const [isReplying, setIsReplying] = useState(false);
    const {userAuth: {accessToken, username}} = useContext(UserContext);
    const {
        commented_by: {personal_info: {profile_img, fullname, username: commentedByUsername}},
        commentedAt,
        comment,
        _id,
        children
    } = commentData;
    const {
        blog,
        blog: {
            comments,
            comments: {results: commentsArray},
            activity,
            activity: {total_parent_comments},
            author: {personal_info: {username: blogAuthor}}
        },
        setBlog,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const handleReply = () => {
        if (!accessToken) {
            return toast.error('Login first to leave a reply');
        }
        setIsReplying(prev => !prev);
    };

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while (commentsArray[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch {
            startingPoint = undefined;
        }
        return startingPoint;
    };

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentsArray[startingPoint]) {
            while (commentsArray[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArray.splice(startingPoint, 1);
                if (!commentsArray[startingPoint]) {
                    break;
                }
            }
        }

        if (isDelete) {
            const parentIndex = getParentIndex();
            if (parentIndex !== undefined) {
                commentsArray[parentIndex].children = commentsArray[parentIndex].children.filter(child => child !== _id);

                if (!commentsArray[parentIndex].children.length) {
                    commentsArray[parentIndex].isReplyLoaded = false;
                }
            }
            commentsArray.splice(index, 1);
        }
        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentsLoaded(prev => prev - 1);
        }
        setBlog({
            ...blog,
            comments: {results: commentsArray},
            activity: {
                ...activity,
                total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0)
            }
        })
    };
    const hideReplies = () => {
        commentData.isReplyLoaded = false;

        removeCommentsCards(index + 1);
    };

    const loadReplies = ({skip = 0, currentIndex = index}) => {
        if (commentsArray[currentIndex].children.length) {
            hideReplies();

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
                _id: commentsArray[currentIndex]._id,
                skip
            })
                .then(({data: {replies}}) => {
                    commentsArray[currentIndex].isReplyLoaded = true;

                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentsArray[currentIndex].childrenLevel + 1;
                        commentsArray.splice(currentIndex + 1 + i + skip, 0, replies[i]);
                    }
                    setBlog({...blog, comments: {...comments, results: commentsArray}})
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };

    const deleteComment = (event) => {
        event.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", {_id}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(() => {
                event.target.removeAttribute("disable");
                removeCommentsCards(index + 1, true);
            })
            .catch(err => {
                console.log(err);
            })
    };

    const LoadMoreRepliesButton = () => {
        const parentIndex = getParentIndex();

        const button = (
            <button onClick={() => loadReplies({skip: index - parentIndex, currentIndex: parentIndex})}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/40 rounded-md flex items-center gap-2">
                Load more replies
            </button>
        )

        if (commentsArray[index + 1]) {
            if (commentsArray[index + 1].childrenLevel < commentsArray[index].childrenLevel && (index - parentIndex) < commentsArray[parentIndex].children.length) {
                return button;
            }
        } else {
            if (parentIndex) {
                if (commentsArray[index + 1].childrenLevel < commentsArray[index].childrenLevel && (index - parentIndex) < commentsArray[parentIndex].children.length) {
                    return button;
                }
            }
        }
    }

    return (
        <div className="w-full" style={{paddingLeft: `${leftValue * 10}px`}}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} alt="user avatar" className="rounded-full w-6 h-6"/>
                    <p className="line-clamp-1">{fullname} @{commentedByUsername}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>
                <p className="text-xl ml-3">{comment}</p>
                <div className="flex gap-5 items-center mt-5">
                    {
                        commentData.isReplyLoaded ? (
                            <button onClick={hideReplies}
                                    className="text-dark-grey p-2 px-3 hover:bg-grey/40 rounded-md flex items-center gap-2">
                                <i className="fi fi-rs-comment-dots"></i>Hide reply
                            </button>
                        ) : (
                            <button onClick={loadReplies}
                                    className="text-dark-grey p-2 px-3 hover:bg-grey/40 rounded-md flex items-center gap-2">
                                <i className="fi fi-rs-comment-dots"></i>{children.length} Replies
                            </button>
                        )
                    }
                    <button className="text-dark-grey p-2 px-3 rounded-md hover:bg-grey/40"
                            onClick={handleReply}>
                        Reply
                    </button>
                    {
                        username === commentedByUsername || username === blogAuthor ? (
                            <button onClick={deleteComment}
                                    className="p-2 px-3 rounded-md text-dark-grey ml-auto hover:bg-red/30 hover:text-red flex items-center">
                                <i className="fi fi-rr-trash pointer-events-none"></i>
                            </button>
                        ) : null
                    }
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
            <LoadMoreRepliesButton/>
        </div>
    );
};

export default CommentCard;