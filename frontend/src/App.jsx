import {useEffect} from "react";
import Navbar from "./components/navbar.component.jsx";
import {Route, Routes} from "react-router-dom";
import UserAuthForm from "./pages/userAuthForm.page.jsx";


const App = () => {
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
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Navbar/>}>
                <Route path="signin" element={<UserAuthForm type='sign-in'/>}/>
                <Route path="signup" element={<UserAuthForm type='sign-up'/>}/>
            </Route>
        </Routes>
    )
}

export default App;