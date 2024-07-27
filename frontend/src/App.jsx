import {createContext, useEffect, useState} from "react";
import Navbar from "./components/navbar.component.jsx";
import {Route, Routes} from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import {lookInSession} from "./common/session.jsx";
import Editor from "./pages/editor.pages.jsx";
import {Toaster} from "react-hot-toast";
import HomePage from "./pages/home.page.jsx";
import SearchPage from "./pages/search.page.jsx";

export const UserContext = createContext({});

const App = () => {
    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {
        const userSelectedLanguage = localStorage.getItem("i18nextLng");
        if (userSelectedLanguage) {
            if (userSelectedLanguage === "fa") {
                document.body.dir = "rtl";
                document.body.className = "fa";
            } else {
                document.body.dir = "ltr";
                document.body.className = "en";
            }
        }

        const userInSession = lookInSession("user");
        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({accessToken: null})
    }, []);

    return (
        <UserContext.Provider value={{userAuth, setUserAuth}}>
            <Routes>
                <Route path="/editor" element={<Editor/>}/>
                <Route path="/" element={<Navbar/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="signin" element={<UserAuthForm type='sign-in'/>}/>
                    <Route path="signup" element={<UserAuthForm type='sign-up'/>}/>
                    <Route path="search/:query" element={<SearchPage/>}/>
                </Route>
            </Routes>
            <Toaster/>
        </UserContext.Provider>
    )
}

export default App;