import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import axios from "axios";
import {BlogContext} from "../pages/blog.page.jsx";

const CommentField = ({action, index = undefined, replyingTo = undefined, setIsReplying}) => {
    const [comment, setComment] = useState('');

    const {userAuth: {accessToken, username, fullname, profile_img}} = useContext(UserContext);
    const {
        blog,
        blog: {
            _id,
            author: {_id: blog_author},
            comments,
            comments: {results: commentsArray},
            activity,
            activity: {total_comments, total_parent_comments}
        },
        setBlog,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const handleComment = () => {
        if (!accessToken) {
            return toast.error("Login to leave a comment!");
        }
        if (!comment.length) {
            return toast.error("Empty comment can't be saved!");
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id,
            blog_author,
            comment,
            replying_to: replyingTo
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(({data}) => {
                setComment('');
                data.commented_by = {personal_info: {username, profile_img, fullname}};
                let parentCommentIncrementValue = replyingTo ? 0 : 1;
                let newCommentsArray;

                if (replyingTo) {
                    commentsArray[index].children.push(data._id);
                    data.childrenLevel = commentsArray[index].childrenLevel + 1;
                    data.parentIndex = index;
                    commentsArray[index].isReplyLoaded = true;
                    commentsArray.splice(index + 1, 0, data);
                    newCommentsArray = commentsArray;
                    setIsReplying(false);
                } else {
                    data.childrenLevel = 0;
                    newCommentsArray = [data, ...commentsArray];
                }


                setBlog({
                    ...blog,
                    comments: {...comments, results: newCommentsArray},
                    activity: {
                        ...activity,
                        total_comments: total_comments + 1,
                        total_parent_comments: total_parent_comments + parentCommentIncrementValue
                    }
                })
                setTotalParentCommentsLoaded(prev => prev + parentCommentIncrementValue);

            })
            .catch(err => {
                console.log(err);
            })
    };

    return (
        <>
            <textarea value={comment}
                      onChange={event => setComment(event.target.value)}
                      placeholder="Leave a comment..."
                      className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
            </textarea>
            <button className="btn-dark mt-5 px-10"
                    onClick={handleComment}>
                {action}
            </button>
        </>
    );
};

export default CommentField;