import {useContext} from "react";
import {UserContext} from "../../App.jsx";
import {Navigate} from "react-router-dom";

const GuestGuard = ({children}) => {
    const {userAuth: {accessToken}} = useContext(UserContext);

    return (
        <>{!accessToken ? children : <Navigate to='/'/>}</>
    )
}

export default GuestGuard;