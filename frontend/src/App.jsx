import {createContext, useEffect, useState} from "react";
import Navbar from "./components/navbar.component.jsx";
import {Route, Routes} from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page.jsx";
import {lookInSession} from "./common/session.jsx";

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
                <Route path="/" element={<Navbar/>}>
                    <Route path="signin" element={<UserAuthForm type='sign-in'/>}/>
                    <Route path="signup" element={<UserAuthForm type='sign-up'/>}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;