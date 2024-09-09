import {Link} from "react-router-dom";
import {useContext} from "react";
import {ThemeContext} from "../App.jsx";

import lightPageNotFoundImage from "../imgs/404-light.png";
import darkPageNotFoundImage from "../imgs/404-dark.png";
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";

const PageNotFound = () => {
    const {theme} = useContext(ThemeContext);
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
            <img src={theme === "light" ? darkPageNotFoundImage : lightPageNotFoundImage} alt="page not found"
                 className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"/>
            <h1 className="text-4xl leading-7">Page not found</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-8">The page you are looking for does not exist. Go back
                to <Link to="/" className="text-black underline">home page</Link></p>
            <div className="mt-auto">
                <img src={theme === "light" ? darkFullLogo : lightFullLogo}
                     className="h-8 object-contain block mx-auto select-none" alt="Logo"/>
                <p className="mt-5 text-dark-grey">Read millions of stories from around the world</p>
            </div>
        </section>
    );
};

export default PageNotFound;