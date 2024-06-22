import logo from "../imgs/logo.png";
import {Link, Outlet} from "react-router-dom";
import {useState} from "react";
import LanguageSelector from "./languageSelector.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import {useTranslation} from "react-i18next";

const Navbar = () => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [languageSelectorVisibility, setLanguageSelectorVisibility] = useState(false);

    const {t, i18n} = useTranslation();

    return (
        <>
            <nav className="navbar flex justify-between w-full">
                <div className="flex items-center gap-2">
                    <Link to="/" className="w-10 h-10">
                        <img src={logo} alt="logo"/>
                    </Link>
                    <div
                        className={`${searchBoxVisibility ? 'show' : 'hide'} md:show absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto`}>
                        <input type="text"
                               placeholder={t("input.search")}
                               className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 "/>
                        <i className={`fi fi-rr-search absolute ${i18n.language === "fa" ? "left" : "right"}-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey`}/>
                    </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
                            onClick={() => setSearchBoxVisibility(prev => !prev)}>
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center"
                            onClick={() => setLanguageSelectorVisibility(prev => !prev)}>
                        <i className="fi fi-rr-globe text-2xl"></i>
                    </button>
                    {
                        languageSelectorVisibility && (
                            <AnimationWrapper>
                                <LanguageSelector/>
                            </AnimationWrapper>
                        )
                    }
                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>Write</p>
                    </Link>
                    <Link to="/signin" className="btn-dark py-2">
                        {t("auth.signin")}
                    </Link>
                    <Link to="/signup" className="btn-light py-2 hidden md:block">
                        {t("auth.signup")}
                    </Link>
                </div>
            </nav>
            <Outlet/>
        </>
    )
}

export default Navbar;