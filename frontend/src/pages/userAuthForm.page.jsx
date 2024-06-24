import InputBox from "../components/input.component.jsx";
import googleIcon from "../imgs/google.png"
import {Link, Navigate} from "react-router-dom";
import AnimationWrapper from "../common/page-animation.jsx";
import {useTranslation} from "react-i18next";
import {toast, Toaster} from "react-hot-toast";
import axios from "axios";
import {storeInSession} from "../common/session.jsx";
import {useContext} from "react";
import {UserContext} from "../App.jsx";
import {authWithGoogle} from "../common/firebase.jsx";

const UserAuthForm = ({type}) => {
    const {t} = useTranslation();

    const {userAuth: {access_token}, setUserAuth} = useContext(UserContext);
    console.log(access_token)
    const userAuthThroughServer = (serverRoute, formData) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({data}) => {
                storeInSession("user", JSON.stringify(data));
                setUserAuth(data);
            })
            .catch(({response}) => {
                toast.error(response?.data?.error)
            })
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = new FormData(event.target);
        const formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        const {fullname, email, password} = formData;
        const serverRoute = type === "sign-in" ? "/signin" : "/signup";
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;


        // form validation
        if (fullname?.length < 3) {
            return toast.error("Full name must have at least 3 characters.");
        }

        if (!email?.length) {
            return toast.error("Enter your email address!")
        }

        if (!emailRegex.test(email)) {
            return toast.error("Invalid email format!")
        }

        if (!passwordRegex.test(password)) {
            return toast.error("Password must be 6 up to 20 characters containing a numeric, a lowercase and a uppercase letter!")
        }

        userAuthThroughServer(serverRoute, formData);
    }

    const handleGoogleAuth = (event) => {
        event.preventDefault();

        authWithGoogle()
            .then(user => {
                const serverRoute = "/google-auth";
                const formData = {
                    access_token: user.accessToken
                }

                userAuthThroughServer(serverRoute, formData)
            })
            .catch(err => {
                toast.error("Trouble with login using Google");
                console.log(err)
            });
    }

    return (
        access_token ? <Navigate to="/"/> :
            <AnimationWrapper keyValue={type}>
                <section className="h-cover flex items-center justify-center">
                    <Toaster/>
                    <form className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
                        <h1 className="text-4xl capitalize text-center mb-24">
                            {t("auth.greeting")}
                        </h1>

                        {
                            type !== "sign-in" && <InputBox name="fullname"
                                                            type="text"
                                                            placeholder={t("account.fullName")}
                                                            icon="fi-rr-user"/>
                        }
                        <InputBox name="email"
                                  type="email"
                                  placeholder={t("account.email")}
                                  icon="fi-rr-envelope"/>

                        <InputBox name="password"
                                  type="password"
                                  placeholder={t("account.password")}
                                  icon="fi-rr-key"/>

                        <button className="btn-dark center mt-14"
                                type="submit">
                            {type === "sign-in" ? t("auth.signin") : t("auth.signup")}
                        </button>

                        <div
                            className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <hr className="w-1/2 border-black"/>
                            <p>{t("auth.or")}</p>
                            <hr className="w-1/2 border-black"/>
                        </div>

                        <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                                onClick={handleGoogleAuth}>
                            <img src={googleIcon} alt="Google Icon" className="w-5"/>
                            {t("auth.googleSignin")}
                        </button>

                        {
                            type === "sign-in" ?
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    {t("auth.notAccount")}
                                    <Link to="/signup" className="underline text-black text-xl ml-1">
                                        {t("auth.join")}
                                    </Link>
                                </p> :
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    {t("auth.account")}
                                    <Link to="/signin" className="underline text-black text-xl ml-1">
                                        {t("auth.enter")}
                                    </Link>
                                </p>
                        }
                    </form>
                </section>
            </AnimationWrapper>
    )
}

export default UserAuthForm;