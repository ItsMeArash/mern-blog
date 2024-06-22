import InputBox from "../components/input.component.jsx";
import googleIcon from "../imgs/google.png"
import {Link} from "react-router-dom";
import AnimationWrapper from "../common/page-animation.jsx";
import {useRef} from "react";
import {useTranslation} from "react-i18next";

const UserAuthForm = ({type}) => {
    const authFormRef = useRef();
    const {t} = useTranslation()
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = new FormData();

    }

    return (
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <form ref={authFormRef} className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
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

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
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