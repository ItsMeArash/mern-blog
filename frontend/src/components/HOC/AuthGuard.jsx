import {useContext} from "react";
import {UserContext} from "../../App.jsx";
import {Navigate} from "react-router-dom";

const AuthGuard = ({children}) => {
    const {userAuth: {accessToken}} = useContext(UserContext);

    return (
        <>{accessToken ? children : <Navigate to="/signin"/>}</>
    )
}

export default AuthGuard;