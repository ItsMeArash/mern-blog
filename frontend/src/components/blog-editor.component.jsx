import {Link, useNavigate} from "react-router-dom";
import AnimationWrapper from "../common/page-animation.jsx";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png"
import {uploadImage} from "../common/aws.jsx";
import {useContext, useEffect} from "react";
import {toast} from "react-hot-toast";
import {EditorContext} from "../pages/editor.pages.jsx";
import EditorJS from "@editorjs/editorjs";
import {tools} from "./tools.component.jsx";
import axios from "axios";
import {UserContext} from "../App.jsx";
import {useTranslation} from "react-i18next";
import LanguageSelector from "./languageSelector.jsx";

const BlogEditor = () => {
    const {
        blog,
        blog: {title, banner, content, tags, des},
        setBlog,
        textEditor,
        setTextEditor,
        setEditorState,
    } = useContext(EditorContext);
    const {userAuth: {accessToken}} = useContext(UserContext);
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: "textEditor",
                data: content,
                tools: tools,
                placeholder: t("article.body-placeholder"),
            }));
        }
    }, []);

    const handleTitleKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    }

    const handleTitleChange = (event) => {
        const input = event.target;

        input.style.height = "auto"
        input.style.height = `${input.scrollHeight}px`;

        setBlog({...blog, title: input.value});
    }

    const handleBannerUpload = (event) => {
        const image = event.target.files[0];
        if (image) {
            let loadingToast = toast.loading(t("toast.uploading"));
            uploadImage(image).then(url => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success(t("toast.uploaded"));
                    setBlog({...blog, banner: url});
                }
            }).catch((err) => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            });
        }
    }

    const handlePublishEvent = () => {
        if (!banner.length) {
            return toast.error(t("toast.no-banner"));
        }
        if (!title.length) {
            return toast.error(t("toast.no-title"));
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({...blog, content: data});
                    setEditorState("publish");
                } else {
                    toast.error(t("toast.no-content"));
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }

    const saveDraft = (event) => {
        if (event.target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write a blog title to save it as draft!");
        }

        const loadingToast = toast.loading("Saving draft...");
        event.target.classList.add("disable");

        if (textEditor.isReady) {
            testEditor.save().then(content => {
                const blogObject = {
                    title, banner, des, content, tags, draft: true
                };

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObject, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                }).then(() => {
                    event.target.classList.remove("disable");
                    toast.dismiss(loadingToast);
                    toast.success("Saved as draft!");

                    setTimeout(() => {
                        navigate('/');
                    }, 500)
                }).catch(({response}) => {
                    event.target.classList.remove("disable");
                    toast.dismiss(loadingToast);
                    return toast.error(response.data.error)
                })
            })
        }
    };

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="logo"/>
                </Link>
                <p className="max-md:hidden text-black font-bold text-xl line-clamp-1 w-full">
                    {title || t("article.new")}
                </p>
                <LanguageSelector/>
                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublishEvent}>{t("article.publish")}</button>
                    <button className="btn-light py-2" onClick={saveDraft}>{t("article.draft")}</button>
                </div>
            </nav>
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div
                            className="related aspect-video bg-white border-4 border-grey hover:opacity-80 cursor-pointer">
                            <label htmlFor="uploadBanner">
                                <img src={banner || defaultBanner} alt="blog banner" className="z-20"/>
                                <input id="uploadBanner" type="file" accept=".png, .jpg, .jpeg" hidden
                                       onChange={handleBannerUpload}/>
                            </label>
                        </div>
                        <textarea defaultValue={title}
                                  placeholder={t("article.title")}
                                  className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                                  onKeyDown={handleTitleKeyDown}
                                  onChange={handleTitleChange}>
                        </textarea>
                        <hr className="w-full opacity-10 my-5"/>
                        <div id="textEditor" className="font-gelasio">
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;