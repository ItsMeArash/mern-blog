import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import axios from "axios";
import {BlogContext} from "../pages/blog.page.jsx";

const CommentField = ({action}) => {
    const [comment, setComment] = useState('');

    const {userAuth: {accessToken, username, fullname, profile_img}} = useContext(UserContext);
    const {
        blog,
        blog: {_id, author: {_id: blog_author}, comments, activity, activity: {total_comments, total_parent_comments}},
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

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {_id, blog_author, comment}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(({data}) => {
                setComment('');
                data.commentedBy = {personal_info: {username, profile_img, fullname}};
                let newCommentArray;

                data.childrenLevel = 0;

                newCommentArray = [data];

                let parentCommentIncrementValue = 1;
                setBlog({
                    ...blog,
                    comments: {...comments, results: newCommentArray},
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