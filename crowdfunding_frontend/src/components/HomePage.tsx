import { useNavigate } from "react-router-dom";
import homeImg from "../assets/home-img.png";
import img1 from '../assets/image.png';
import { motion } from 'framer-motion';
import { SlideRight } from "../Utils/animations";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <section className="bg-bgColor max-h-full">
            <div className="px-8 md:px-12 pt-12 pb-8">
                <div className="md:hidden">
                    <motion.div 
                        variants={SlideRight(0.9)}
                        initial="hidden"
                        animate='visible'
                        className="font-Outfit w-full"
                    >
                        <motion.h1 
                            initial={{opacity: 0, x:-200}}
                            whileInView={{ opacity: 1, x: 0}}
                            transition={{ duration: 1, delay: 0.3}}
                            className="text-white text-xl"
                        >
                            <span className="text-limeTxt font-semibold text-xl">AgriConnect</span> - Where Investments meets Agriculture
                        </motion.h1>
                        <motion.p 
                           initial={{opacity: 0, x:-200}}
                           whileInView={{ opacity: 1, x: 0}}
                           transition={{ duration: 1, delay: 0.6}}
                            className="mt-8 text-white"
                        >
                            A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                            From farm expansion to sustainable technology adoption - funding agriculture made simple.
                        </motion.p>
                    </motion.div>

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

                        <motion.img
                            initial={{opacity:0, scale:0.5}}
                            whileInView={{opacity:1, scale:1}}
                            transition={{duration:1.4, delay:0}} 
                            src={homeImg}
                            alt="Farmers and investors connecting"
                            className="h-[200px] w-full object-contain rounded-xl shadow-lg"
                        />
                    </div>
                </div>

                <div className="hidden md:flex gap-8 items-center">
                    <div className="font-Outfit w-1/2">
                        <motion.h1 
                           initial={{opacity: 0, x:-200}}
                           whileInView={{ opacity: 1, x: 0}}
                           transition={{ duration: 1, delay: 0.3}}
                            className="text-white text-3xl">
                            <span className="text-limeTxt font-semibold text-5xl">AgriConnect</span> - Where Investments meets Agriculture
                        </motion.h1>
                        <motion.p 
                            initial={{opacity: 0, x:-200}}
                            whileInView={{ opacity: 1, x: 0}}
                            transition={{ duration: 1, delay: 0.6}}
                            className="mt-8 text-white"
                        >
                            A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                            From farm expansion to sustainable technology adoption - funding agriculture made simple.
                        </motion.p>
                       
                    </div>

                    <div className="w-1/2">
                        <motion.img
                            initial={{opacity:0, scale:0.5}}
                            whileInView={{opacity:1, scale:1}}
                            transition={{duration:1.4, delay:0}} 
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