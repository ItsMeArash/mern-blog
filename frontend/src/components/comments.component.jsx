import {useContext} from "react";
import {BlogContext} from "../pages/blog.page.jsx";
import CommentField from "./comment-field.component.jsx";
import axios from "axios";
import NoDataMessage from "./nodata.component.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import CommentCard from "./comment-card.component.jsx";

export const fetchComments = async ({skip = 0, blog_id, setParentCommentsCount, commentsArray = null}) => {
    let res;

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", {blog_id, skip})
        .then(({data}) => {
            data.map(comment => {
                comment.childrenLevel = 0;
            });
            setParentCommentsCount(prev => prev + data.length);

            if (commentsArray === null) {
                res = {results: data};
            } else {
                res = {results: [...commentsArray, ...data]};
            }
        })

    return res;
}

const CommentsContainer = () => {
    const {
        blog,
        blog: {_id, title, comments: {results: commentsArray}, activity: {total_parent_comments}},
        setBlog,
        commentsWrapper,
        setCommentsWrapper,
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded
    } = useContext(BlogContext);

    const loadMoreComments = async () => {
        const newCommentsArray = await fetchComments({
            skip: totalParentCommentsLoaded,
            blog_id: _id,
            setParentCommentsCount: setTotalParentCommentsLoaded,
            commentsArray: commentsArray
        });
        setBlog({...blog, comments: newCommentsArray});
    };

    return (
        <div
            className={"max-sm:w-full fixed " + (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") + " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"}>
            <div className="relative">
                <h1 className="text-xl font-medium">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</p>
                <button onClick={() => setCommentsWrapper(false)}
                        className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey">
                    <i className="fi fi-br-cross text-xl mt-1"></i>
                </button>
            </div>
            <hr className="border-grey my-8 w-[120%] -ml-10"/>
            <CommentField action="comment"/>
            {
                commentsArray?.length ? commentsArray.map((comment, index) => {
                    return (
                        <AnimationWrapper key={index}>
                            <CommentCard index={index}
                                         leftValue={comment.childrenLevel * 4}
                                         commentData={comment}/>
                        </AnimationWrapper>
                    );
                }) : <NoDataMessage message="No comments in here :("/>
            }
            {
                total_parent_comments > totalParentCommentsLoaded && (
                    <button onClick={loadMoreComments}
                            className="text-dark-grey p-2 px-3 hover:bg-grey/40 rounded-md flex items-center gap-2 active:bg-grey">
                        Load More
                    </button>
                )
            }
        </div>
    );
};

export default CommentsContainer;