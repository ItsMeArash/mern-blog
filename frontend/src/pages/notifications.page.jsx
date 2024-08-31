import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {UserContext} from "../App.jsx";
import {filterPaginationData} from "../common/filter-pagination-data.jsx";
import Loader from "../components/loader.component.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import NotificationCard from "../components/notification-card.component.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";

const Notifications = () => {
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState(null);

    const filters = ["all", "like", "comment", "reply"];

    const {userAuth: {accessToken}} = useContext(UserContext);

    useEffect(() => {
        if (accessToken) {
            fetchNotifications({page: 1});
        }
    }, [accessToken, filter]);

    const fetchNotifications = ({page, deletedDocCount = 0}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", {page, filter, deletedDocCount},
            {headers: {Authorization: `Bearer ${accessToken}`}})
            .then(async ({data: {notifications: data}}) => {
                const formattedData = await filterPaginationData({
                    state: notifications,
                    data,
                    page,
                    countRoute: "/all-notifications-count",
                    data_to_send: {filter},
                    user: accessToken
                })

                setNotifications(formattedData);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleFilterChange = (event) => {
        setFilter(event.target.innerText.toLowerCase());
        setNotifications(null);
    };

    return (
        <div>
            <h1 className="max-md:hidden">
                Recent Notifications
            </h1>
            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, index) => (
                        <button key={index}
                                className={`py-2 btn-${filterName === filter ? "dark" : "light"}`}
                                onClick={handleFilterChange}>
                            {filterName}
                        </button>)
                    )
                }
            </div>
            {
                notifications === null ? <Loader/> : (
                    <>
                        {
                            notifications.results.length ?
                                notifications.results.map((notification, index) => {
                                    return (
                                        <AnimationWrapper key={index} transition={{delay: index * 0.08}}>
                                            <NotificationCard data={notification}
                                                              index={index}
                                                              notificationState={{notifications, setNotifications}}/>
                                        </AnimationWrapper>
                                    )
                                }) :
                                <NoDataMessage message="No notifications here!"/>
                        }
                    </>
                )
            }
            <LoadMoreDataBtn state={notifications}
                             fetchData={fetchNotifications}
                             additionalParams={{deletedDocCount: notifications?.deletedDocCount}}/>
        </div>
    );
};

export default Notifications;