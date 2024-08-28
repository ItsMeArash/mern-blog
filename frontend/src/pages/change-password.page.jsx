import AnimationWrapper from "../common/page-animation.jsx";
import InputBox from "../components/input.component.jsx";
import {useContext} from "react";
import {toast} from "react-hot-toast";
import axios from "axios";
import {UserContext} from "../App.jsx";

const ChangePassword = () => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const {userAuth: {accessToken}} = useContext(UserContext);

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = new FormData(event.target);
        const formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        const {currentPassword, newPassword} = formData;

        if (!currentPassword?.length || !newPassword?.length) {
            return toast.error("Fill all the inputs");
        }

        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("Password must be 6 up to 20 characters containing a numeric, a lowercase and a uppercase letter!");
        }


        event.target.setAttribute("disabled", true);
        const loadingToast = toast.loading("Updating password...");
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(() => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                return toast.success("Password has been updated!");
            })
            .catch(({response}) => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                return toast.error(response.data.error);
            })
    };

    return (
        <AnimationWrapper>
            <form onSubmit={handleSubmit}>
                <h1 className="max-md:hidden ">Change Password</h1>
                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword"
                              type="password"
                              className="profile-edit-input"
                              placeholder="Current Password"
                              icon="fi-rr-unlock"/>
                    <InputBox name="newPassword"
                              type="password"
                              className="profile-edit-input"
                              placeholder="New Password"
                              icon="fi-rr-unlock"/>
                    <button className="btn-dark px-10"
                            type="submit">
                        Change Password
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default ChangePassword;