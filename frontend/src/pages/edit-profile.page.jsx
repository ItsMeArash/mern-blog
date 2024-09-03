import {useContext, useEffect, useRef, useState} from 'react';
import {UserContext} from "../App.jsx";
import axios from "axios";
import {profileDataStructure} from "./profile.page.jsx";
import AnimationWrapper from "../common/page-animation.jsx";
import Loader from "../components/loader.component.jsx";
import InputBox from "../components/input.component.jsx";
import {toast} from "react-hot-toast";
import {uploadImage} from "../common/aws.jsx";
import {storeInSession} from "../common/session.jsx";
import {useTranslation} from "react-i18next";

const EditProfile = () => {
    const {userAuth, userAuth: {accessToken}, setUserAuth} = useContext(UserContext);

    const bioLimit = 150;

    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [charactersLeft, setCharactersLeft] = useState(bioLimit);
    const [updatedProfileImage, setUpdatedProfileImage] = useState(null);

    const profileImage = useRef();

    const {t} = useTranslation();

    const {
        personal_info: {
            fullname,
            username: profile_username,
            profile_img,
            email,
            bio
        }, social_links
    } = profile;

    useEffect(() => {
        if (accessToken) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {username: userAuth.username})
                .then(({data}) => {
                    setProfile(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                })
        }
    }, [accessToken]);

    const handleCharactersLeft = (event) => {
        setCharactersLeft(bioLimit - event.target.value.length);
    };

    const handleImagePreview = (event) => {
        const image = event.target.files[0];
        profileImage.current.src = URL.createObjectURL(image);
        setUpdatedProfileImage(image);
    };

    const handleImageUpload = (event) => {
        event.preventDefault();

        if (updatedProfileImage) {
            const loadingToast = toast.loading("Uploading...");
            event.target.setAttribute("disabled", true);

            uploadImage(updatedProfileImage)
                .then(url => {
                    if (url) {
                        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img", {url}, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        })
                            .then(({data}) => {
                                const newUserAuth = {...userAuth, profile_img: data.profile_img};
                                storeInSession("user", JSON.stringify(newUserAuth));
                                setUserAuth(newUserAuth);

                                setUpdatedProfileImage(null);

                                toast.dismiss(loadingToast);
                                event.target.removeAttribute("disabled");
                                toast.success(t("toast.uploaded"));
                            })
                            .catch(({response}) => {
                                toast.dismiss(loadingToast);
                                event.target.removeAttribute("disabled");
                                toast.error(response.data.error);
                            })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        const formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        const {username, bio, youtube, facebook, twitter, github, instagram, website} = formData;

        if (username.length < 3) {
            return toast.error("Username must have at least 3 characters");
        }
        if (bio.length > bioLimit) {
            return toast.error(`Bio must be less than ${bioLimit} characters!`);
        }

        const loadingToast = toast.loading("Updating...");
        event.target.setAttribute("disabled", true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {
            username, bio, social_links: {youtube, facebook, twitter, github, instagram, website}
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(({data}) => {
                if (userAuth.use !== data.username) {
                    const newUserAuth = {...userAuth, username: data.username};
                    storeInSession("user", JSON.stringify(newUserAuth));
                    setUserAuth(newUserAuth);
                }
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.success("Profile updated!");
            })
            .catch(({response}) => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.error(response.data.error);
            })
    };

    return (
        <AnimationWrapper>
            {loading ? <Loader/> : (
                <form onSubmit={handleSubmit}>
                    <h1 className="max-md:hidden">Edit Profile</h1>

                    <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                        <div className="max-lg:center mb-5">
                            <label htmlFor="uploadImg"
                                   id="profileImgLabel"
                                   className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                <div className="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center text-right
                                     text-white bg-black/60 opacity-0 hover:opacity-100 cursor-pointer">
                                    <i className="fi fi-rr-upload text-2xl"></i>
                                    Upload Image
                                </div>
                                <img ref={profileImage} src={profile_img} alt="user avatar"
                                     className="overflow-hidden"/>
                            </label>
                            <input type="file"
                                   id="uploadImg"
                                   accept="image/*"
                                   hidden
                                   onChange={handleImagePreview}/>
                            <button className="btn-light mt-5 max-lg:center lg:w-full px-10"
                                    onClick={handleImageUpload}>Upload
                            </button>
                        </div>
                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                                <div>
                                    <InputBox name="fullname"
                                              type="text"
                                              value={fullname}
                                              placeholder="Full Name"
                                              disabled
                                              icon="fi-rr-user"/>
                                </div>
                                <div>
                                    <InputBox name="email"
                                              type="email"
                                              value={email}
                                              placeholder="Email"
                                              disabled
                                              icon="fi-rr-envelope"/>
                                </div>
                            </div>
                            <InputBox type="text"
                                      name="username"
                                      value={profile_username}
                                      placeholder="Username"
                                      icon="fi-rr-at"/>
                            <p className="text-dark-grey -mt-3">
                                Username will be used for searching user and is visible to other users
                            </p>
                            <textarea name="bio"
                                      maxLength={bioLimit}
                                      defaultValue={bio}
                                      className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                                      placeholder="Bio"
                                      onChange={handleCharactersLeft}>
                            </textarea>
                            <p className="mt-1 text-dark-grey">{charactersLeft} Characters left</p>
                            <p className="my-6 text-dark-grey">Add your social handles here</p>

                            <div className="md:grid md:grid-cols-2 gap-x-6">
                                {
                                    Object.keys(social_links).map((key, index) => {
                                        const link = social_links[key];
                                        return <InputBox key={index}
                                                         name={key}
                                                         type="text"
                                                         value={link}
                                                         placeholder="https://"
                                                         icon={key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"}/>
                                    })
                                }
                            </div>
                            <button className="btn-dark w-auto px-10"
                                    type="submit">
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </AnimationWrapper>
    );
};

export default EditProfile;