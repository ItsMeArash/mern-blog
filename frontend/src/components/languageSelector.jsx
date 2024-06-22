import {useTranslation} from "react-i18next";
import {useEffect} from "react";

const languages = [
    {code: "en", lang: "English"},
    {code: "fa", lang: "فارسی"}
]

const LanguageSelector = ({setLanguageSelectorVisibility}) => {
    const {i18n} = useTranslation();

    useEffect(() => {
        document.body.dir = i18n.dir();
    }, [i18n, i18n.language]);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
    };
    return (
        <div className="flex gap-2">
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
    )
};

export default LanguageSelector;