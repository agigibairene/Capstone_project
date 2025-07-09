import { motion } from "framer-motion";
import logo from '../assets/logo.png';

import {  NavLink } from "react-router-dom";

export default function GrantsHeader(){

    return(
        <header className="bg-bgColor sticky z-10 top-0">
            <nav className="px-8 flex justify-between items-center font-Kumbh py-4">
                <motion.div 
                initial={{opacity: 0, scale: 0}}
                whileInView={{ opacity: 1, scale: 1}}
                className="flex items-center">
                    <img src={logo} alt="" />
                    <span className="ml-2 font-logo text-xl text-limeTxt cursor-pointer">AgriConnect</span>
                </motion.div>
                <motion.div
                    initial={{opacity: 0, scale: 0}}
                    whileInView={{ opacity: 1, scale: 1}}
                    className="flex items-center gap-4"
                >
                 <NavLink className="font-bold font-text border-0 outline-0 text-xl text-white rounded-lg" to="/">Home</NavLink>  
                </motion.div>

            </nav>
        </header>
    )
}