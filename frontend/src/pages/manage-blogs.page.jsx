import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {UserContext} from "../App.jsx";
import {filterPaginationData} from "../common/filter-pagination-data.jsx";

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState('');

    const {userAuth: {accessToken}} = useContext(UserContext);

    useEffect(() => {
        if (accessToken) {
            if (blogs === null) {
                getBlogs({page: 1, draft: false})
            }
            if (drafts === null) {
                getBlogs({page: 1, draft: true})
            }
        }
    }, [accessToken, blogs, drafts, query]);

    const getBlogs = ({page, draft, deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs", {page, draft, query, deletedDocCount}, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(async ({data}) => {
                const formattedData = await filterPaginationData({
                    state: draft ? drafts : blogs,
                    data: data.blogs,
                    page,
                    user: accessToken,
                    countRoute: "/user-written-blogs-count",
                    data_to_send: {draft, query}
                })

                draft ? setDrafts(formattedData) : setBlogs(formattedData);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleChange = (event) => {

    };

    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);

        if (event.keyCode === 13 && searchQuery.length) {
            //     handle submit

        }
    };

    return (
        <>
            <h1 className="max-md:hidden">Manage Blogs</h1>
            <div className="relative max-md:mt-5 md:mt-8 mb-10">
                <input type="search"
                       className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
                       placeholder="Search Blogs"
                       onChange={handleChange}
                       onKeyDown={handleSearch}/>
                <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
            </div>
        </>
    );
};

export default ManageBlogs;