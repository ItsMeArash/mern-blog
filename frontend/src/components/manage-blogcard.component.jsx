import {Link} from "react-router-dom";
import {getDay} from "../common/date.jsx";
import {useState} from "react";

const ManagePublishedBlogCard = ({blog}) => {
    const {banner, blog_id, title, publishedAt, activity} = blog;
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
                <div className="flex flex-col justify-between py-2 w-fullmin-w-[300px]">
                    <div>
                        <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">{title}</Link>
                        <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
                    </div>
                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
                        <button className="lg:hidden pr-4 py-2 underline" onClick={toggleStats}>Stats</button>
                        <button className="pr-4 py-2 underline text-red">Delete</button>
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

const BlogStats = ({stats}) => {
    return (
        <div className="flex gap-1">
            {
                Object.keys(stats).map((info, index) => (
                    <div className="flex flex-col items-center w-full h-full justify-center p-4 px-6" key={index}>
                        <h1>{stats[info].toLocaleString()}</h1>
                    </div>
                ))
            }
        </div>
    );
};

export default ManagePublishedBlogCard;