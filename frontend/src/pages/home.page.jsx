import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx";

const HomePage = () => {
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/*Latest blogs*/}
                <div className="w-full">
                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <h1>Home Heading</h1>
                        <h1>Trending Heading</h1>
                    </InPageNavigation>
                </div>
                {/*dFilters and trending blogs*/}
                <div className="">

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;