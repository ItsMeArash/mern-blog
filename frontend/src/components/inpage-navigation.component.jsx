import {useEffect, useRef, useState} from "react";

export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({routes, defaultHidden = [], defaultActiveIndex = 0, children}) => {
    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
    const [width, setWidth] = useState(window.innerWidth);
    const [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
    activeTabLineRef = useRef();
    activeTabRef = useRef();

    useEffect(() => {
        if (width > 766 && inPageNavIndex !== defaultActiveIndex) {
            changePageState(activeTabRef.current, defaultActiveIndex);
        }

        changePageState(activeTabRef.current, defaultActiveIndex);

        if (!isResizeEventAdded) {
            window.addEventListener("resize", () => {
                if (!isResizeEventAdded) {
                    setIsResizeEventAdded(true);
                }
                setWidth(window.innerWidth);
            });
        }
    }, [width]);

    const changePageState = (button, index) => {
        const {offsetWidth, offsetLeft} = button;

        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";

        setInPageNavIndex(index);
    };

    return (
        <>
            <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
                {
                    routes.map((route, index) => {
                        return (
                            <button key={index}
                                    ref={index === defaultActiveIndex ? activeTabRef : null}
                                    className={"p-4 px-5 capitalize " + (inPageNavIndex === index ? "text-black " : "text-dark-grey ") + (defaultHidden.includes(route) ? " md:hidden" : "")}
                                    onClick={(event) => {
                                        changePageState(event.target, index);
                                    }}>
                                {route}
                            </button>
                        );
                    })
                }
                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-dark-grey"/>
            </div>
            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    );
};

export default InPageNavigation;