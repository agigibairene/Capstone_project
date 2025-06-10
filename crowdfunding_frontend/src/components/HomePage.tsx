import { useNavigate } from "react-router-dom";
import homeImg from "../assets/home-img.png";
import animation from "../assets/home-animation.json";
import Lottie from "lottie-react";
import img1 from '../assets/image.png';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <section className="bg-bgColor max-h-full">
            <div className="px-8 md:px-12 pt-12 pb-8">
                {/* Mobile/Tablet - Single column layout */}
                <div className="md:hidden">
                    <div className="font-Outfit w-full">
                        <h1 className="text-white text-xl">
                            <span className="text-limeTxt font-semibold text-xl">AgriConnect</span> - Where Investments meets Agriculture
                        </h1>
                        <p className="mt-8 text-white">
                            A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                            From farm expansion to sustainable technology adoption - funding agriculture made simple.
                        </p>
                    </div>

                    <div className="mt-8 relative w-full">
                        <button 
                            onClick={() => navigate('/login')} 
                            className="absolute cursor-pointer
                                -top-2 
                                left-[22%] 
                                transform -translate-x-1/2
                                text-sm 
                                bg-limeTxt text-bgColor font-semibold 
                                px-8 
                                py-1 
                                rounded-tl-3xl rounded-br-3xl 
                                shadow-md hover:scale-105 transition-transform
                                whitespace-nowrap"
                        >
                            Login
                        </button>

                        <img
                            src={homeImg}
                            alt="Farmers and investors connecting"
                            className="h-[200px] w-full object-contain rounded-xl shadow-lg"
                        />
                    </div>
                </div>

                <div className="hidden md:flex gap-8 items-center">
                    <div className="font-Outfit w-1/2">
                        <h1 className="text-white text-3xl">
                            <span className="text-limeTxt font-semibold text-5xl">AgriConnect</span> - Where Investments meets Agriculture
                        </h1>
                        <p className="mt-8 text-white">
                            A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                            From farm expansion to sustainable technology adoption - funding agriculture made simple.
                        </p>
                       
                    </div>

                    <div className="w-1/2">
                        {/* <div className="h-[350px] w-[450px]">
                            <Lottie animationData={animation} loop={true} />
                        </div> */}
                        <img
                            src={img1}
                            alt="Farmers and investors connecting"
                            className="h-[480px] w-full object-contain rounded-xl shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}