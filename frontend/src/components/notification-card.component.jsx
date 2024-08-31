import {Link} from "react-router-dom";
import {getDay} from "../common/date.jsx";
import {useState} from "react";
import NotificationCommentField from "./notification-comment-field.component.jsx";

const NotificationCard = ({data, index, notificationState}) => {
    const [isReplying, setIsReplying] = useState(false)

    const {
        type,
        comment,
        replied_on_comment,
        createdAt,
        user,
        user: {personal_info: {fullname, username, profile_img}},
        blog: {_id, blog_id, title},
        _id: notification_id
    } = data;

    const handleReplyClick = () => {
        setIsReplying(prev => !prev);
    };

    return (
        <div className="p-6 border-b border-grey border-l-black">
            <div className="flex gap-5 mb-3">
                <img src={profile_img}
                     alt="user avatar"
                     className="w-14 h-14 flex-none rounded-full"/>
                <div className="w-full">
                    <h1 className="font-medium text-xl text-dark-grey">
                        <span className="lg:inline-block hidden capitalize">{fullname}</span>
                        <Link to={`/user/${username}`}
                              className="mx-1 text-black underline underline-offset-3">@{username}</Link>
                        <span className="font-normal">
                            {
                                type === "like" ? "liked your blog"
                                    : type === "comment" ? "commented on"
                                        : "replied on"
                            }
                        </span>
                    </h1>
                    {
                        type === "reply" ? (
                            <div className="p-4 mt-4 rounded-md bg-grey">
                                <p>{replied_on_comment.comment}</p>
                            </div>
                        ) : (
                            <Link to={`/blog/${blog_id}`}
                                  className="font-medium text-dark-grey hover:underline line-clamp-1">
                                {`"${title}"`}
                            </Link>
                        )
                    }
                </div>
            </div>
            {
                type !== "like" && (
                    <p className="ml-14 pl-5 text-xl my-5">{comment.comment}</p>
                )
            }
            <div className="ml-4 pl-5 mt-3 text-dark-grey flex gap-8">
                <p className="">{getDay(createdAt)}</p>
                {
                    type !== "like" && (
                        <>
                            <button className="underline hover:text-black"
                                    onClick={handleReplyClick}>
                                Reply
                            </button>
                            <button className="underline hover:text-black">
                                Delete
                            </button>
                        </>
                    )
                }
            </div>
            {
                isReplying && (
                    <div className="mt-8">
                        <NotificationCommentField _id={_id}
                                                  blog_author={user}
                                                  index={index}
                                                  replyingTo={comment._id}
                                                  setIsReplying={setIsReplying}
                                                  notification_id={notification_id}
                                                  notificationData={notificationState}/>
                    </div>
                )
            }
        </div>
    );
};

export default NotificationCard;