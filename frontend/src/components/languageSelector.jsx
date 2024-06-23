import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";

const languages = [
    {code: "en", lang: "English"},
    {code: "fa", lang: "فارسی"}
]

const LanguageSelector = () => {
    const [visibility, setVisibility] = useState(false);
    const {i18n} = useTranslation();

    useEffect(() => {
        document.body.dir = i18n.dir();
    }, [i18n, i18n.language]);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        document.body.className = language;
    };

    return (
        <>
            <div className='bg-grey flex rounded-full items-center'>
                <button className="w-12 h-12 rounded-full flex items-center justify-center"
                        onClick={() => setVisibility(prev => !prev)}>
                    <i className="fi fi-rr-globe text-2xl"></i>
                </button>
            </div>
            <div className={`${visibility ? "absolute" : "hidden"} flex-col gap-2 top-16 bg-grey rounded-2xl hover:border-none shadow-xl`}
            onBlur={() => setVisibility(false)}>
                {
                    languages.map(lan => (
                        <button
                            className={`${lan.code === i18n.language ? "btn-dark" : ""} ${lan.code === "fa" ? "fa" : ""}
                                        px-4 border-b-2 hover:border-none rounded-full my-4 mx-2 block py-2 `}
                            key={lan.code}
                            onClick={() => changeLanguage(lan.code)}>
                            {lan.lang}
                        </button>
                    ))
                }
            </div>
        </>
    )
};

export default LanguageSelector;