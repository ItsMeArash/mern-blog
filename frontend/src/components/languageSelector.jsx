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
        <div className='bg-grey flex rounded-full items-center'>
            <button className="w-12 h-12 rounded-full flex items-center justify-center"
                    onClick={() => setVisibility(prev => !prev)}>
                <i className="fi fi-rr-globe text-2xl"></i>
            </button>
            <div className={`${visibility ? "flex" : "hidden"} gap-2`}>
                {
                    languages.map(lan => (
                        <button className={`${lan.code === i18n.language ? "btn-dark" : ""} px-4 py-2`}
                                key={lan.code}
                                onClick={() => changeLanguage(lan.code)}>
                            {lan.lang}
                        </button>
                    ))
                }
            </div>
        </div>
    )
};

export default LanguageSelector;