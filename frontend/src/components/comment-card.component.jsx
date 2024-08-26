import {getDay} from "../common/date.jsx";

const CommentCard = ({index, leftValue, commentData}) => {
    const {commented_by: {personal_info: {profile_img, fullname, username}}, commentedAt, comment} = commentData;

    return (
        <div className="w-full" style={{paddingLeft: `${leftValue * 10}px`}}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} alt="user avatar" className="rounded-full w-6 h-6"/>
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>
                <p className="text-xl ml-3">{comment}</p>
                {/*<div className="">*/}
                {/*    */}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default CommentCard;