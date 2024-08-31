import {useContext, useState} from "react";
import {UserContext} from "../App.jsx";
import {toast} from "react-hot-toast";
import axios from "axios";

const NotificationCommentField = ({
                                      _id,
                                      blog_author,
                                      index = undefined,
                                      replyingTo = undefined,
                                      setIsReplying,
                                      notification_id,
                                      notificationData
                                  }) => {
    const [comment, setComment] = useState('');

    const {_id: user_id} = blog_author;
    const {userAuth: {accessToken}} = useContext(UserContext);
    const {notifications, notifications: {results}, setNotifications} = notificationData;

    const handleComment = () => {
        if (!comment.length) {
            return toast.error("Empty comment can't be saved!");
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id,
            blog_author: user_id,
            comment,
            replying_to: replyingTo,
            notification_id
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(({data}) => {
                if (setIsReplying) {
                    setIsReplying(false);

                    results[index].reply = {comment, _id: data._id};
                    setNotifications({...notifications, results});
                }
            })
            .catch(err => {
                console.log(err);
            })
    };

    return (
        <>
            <textarea value={comment}
                      onChange={event => setComment(event.target.value)}
                      placeholder="Leave a reply..."
                      className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
            </textarea>
            <button className="btn-dark mt-5 px-10"
                    onClick={handleComment}>
                Reply
            </button>
        </>
    );
};

export default NotificationCommentField;