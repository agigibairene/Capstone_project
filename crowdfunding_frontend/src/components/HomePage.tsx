import Header from "../Utils/Header";
import homeImg from "../assets/home-img.png";

export default function HomePage(){
    return(
        <section className="bg-bgColor max-h-full">
            <Header />

            <div className="px-8 md:px-12 pt-12 pb-8">
                    <div className="font-Outfit w-full md:w-[80%]">
                        <h1 className="text-white text-xl md:text-3xl">
                            <span className="text-limeTxt font-semibold text-xl md:text-5xl">AgriConnect</span> - Where Investments meets Agriculture
                        </h1>
                        <p className="mt-8 text-white">A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                             From farm expansion to sustainable technology adoption - funding agriculture made simple.
                        </p>
                    </div>

                <div className="mt-8 relative w-full">
                    <button className="absolute cursor-pointer
                        -top-2 md:-top-[5px] 
                        left-[22%] md:left-8 
                        transform -translate-x-1/2 md:translate-x-0
                        text-sm md:text-md 
                        bg-limeTxt text-bgColor font-semibold 
                        px-8 md:px-16 
                        py-1 md:py-2 
                        rounded-tl-3xl rounded-br-3xl 
                        shadow-md hover:scale-105 transition-transform
                        whitespace-nowrap">
                        Login
                    </button>

                    <img
                        src={homeImg}
                        alt="Farmers and investors connecting"
                        className="h-[200px] md:h-[350px] w-full object-contain rounded-xl shadow-lg"
                    />
                </div>

            </div>
        </section>
    )
}