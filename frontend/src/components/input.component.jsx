import {useState} from "react";

const InputBox = ({name, type, id, value, placeholder, icon, disabled = false}) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="relative w-[100%] mb-4">
            <input name={name}
                   type={type === "password" && passwordVisible ? "text" : type}
                   placeholder={placeholder}
                   disabled={disabled}
                   defaultValue={value}
                   id={id}
                   className="input-box"/>
            <i className={`fi ${icon} input-icon`}></i>
            {
                type === "password" && <i onClick={() => setPasswordVisible(prev => !prev)}
                                          className={`fi fi-rr-eye${passwordVisible ? '-crossed' : ''} input-icon left-[auto] right-4 cursor-pointer`}></i>
            }
        </div>
    )
}

export default InputBox;