import AnimationWrapper from "../common/page-animation.jsx";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {useContext} from "react";
import {UserContext} from "../App.jsx";
import {removeFromSession} from "../common/session.jsx";

const UserNavigationPanel = () => {
    const {userAuth: {username}, setUserAuth} = useContext(UserContext);
    const {t} = useTranslation();

    const signOutUser = () => {
        removeFromSession("user");
        // TODO ACCESSTOKEN
        setUserAuth({accessToken: null})
    }


    return (
        <AnimationWrapper className="absolute right-0 z-50" transition={{duration: 0.2}}>
            <div className="bg-white absolute right-0 border border-grey w-60 overflow-hidden duration-200">
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                    <i className="fi fi-rr-file-edit"></i>
                    <p>{t("article.write")}</p>
                </Link>
                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    Profile
                </Link>
                <Link to="/user/blogs" className="link pl-8 py-4">
                    Dashboard
                </Link>
                <Link to="/settings/edit-profile" className="link pl-8 py-4">
                    Settings
                </Link>

                <span className="absolute border-t border-grey w-[100%]"></span>

                <button className="text-left p-4  hover:bg-grey w-full pl-8 py-4" onClick={signOutUser}>
                    <h4 className="font-bold text-xl">Sign Out</h4>
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    )
};

export default UserNavigationPanel;