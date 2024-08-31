import logo from "../imgs/logo.png";
import {Link, Outlet, useNavigate} from "react-router-dom";
import {useContext, useEffect, useRef, useState} from "react";
import LanguageSelector from "./languageSelector.jsx";
import {useTranslation} from "react-i18next";
import {UserContext} from "../App.jsx";
import UserNavigationPanel from "./user-navigation.component.jsx";
import axios from "axios";

const Navbar = () => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    const searchInputRef = useRef(null);

    const {
        userAuth,
        userAuth: {accessToken, profile_img, new_notification_available},
        setUserAuth
    } = useContext(UserContext);

    const {t, i18n} = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(({data}) => {
                    setUserAuth({...userAuth, ...data});
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [accessToken]);

    const handleUserNavPanel = () => {
        setUserNavPanel(prev => !prev);
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 100)
    }

    const handleSearch = (event) => {
        const query = event.target.value;

        if (event.keyCode === 13 && query.length) {
            event.target.value = '';
            setSearchBoxVisibility(false);
            navigate(`/search/${query}`)
        }
    };

    const showSearchBar = () => {
        setSearchBoxVisibility(true);
        searchInputRef.current?.focus()
    }

    return (
        <>
            <nav className="navbar flex justify-between w-full h-full z-50">
                <div className="flex items-center gap-2">
                    <Link to="/" className="w-10 h-10">
                        <img src={logo} alt="logo"/>
                    </Link>
                    <div
                        className={`search-box ${searchBoxVisibility ? 'show' : 'hide'} md:show absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto`}>
                        <input type="text"
                               placeholder={t("input.search")}
                               ref={searchInputRef}
                               className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                               onKeyDown={handleSearch}/>
                        <i className={`fi fi-rr-search absolute ${i18n.language === "fa" ? "left" : "right"}-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey`}/>
                    </div>
                    <div className={`search-overlay ${searchBoxVisibility ? 'show' : ''}`}
                         onClick={() => setSearchBoxVisibility(false)}></div>
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
                            onClick={showSearchBar}>
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    <LanguageSelector/>

                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>{t("article.write")}</p>
                    </Link>

                    {
                        accessToken ? (
                            <>
                                <Link to="/dashboard/notification">
                                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                                        <i className="fi fi-rr-bell text-2xl block mt-1 "></i>
                                        {
                                            new_notification_available && (
                                                <span
                                                    className="bg-red w-3 h-3 rounded-full absolute z-10 top-0 right-0"></span>
                                            )
                                        }
                                    </button>
                                </Link>
                                <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                    <button className="w-12 h-12 mt-1">
                                        <img src={profile_img} alt="avatar"
                                             className="w-full h-full object-cover rounded-full"/>
                                    </button>
                                    {userNavPanel && <UserNavigationPanel/>}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="btn-dark py-2">
                                    {t("auth.signin")}
                                </Link>
                                <Link to="/signup" className="btn-light py-2 hidden md:block">
                                    {t("auth.signup")}
                                </Link>
                            </>
                        )
                    }

                </div>
            </nav>
            <Outlet/>
        </>
    )
}

export default Navbar;