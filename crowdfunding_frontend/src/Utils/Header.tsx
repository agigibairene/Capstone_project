import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { AnimatePresence, motion } from 'framer-motion';
import { NavAnimation } from "./animations";
import { RxHamburgerMenu } from "react-icons/rx";
import { LiaTimesSolid } from "react-icons/lia";
import { useState } from "react";


interface NavList{
    name: string
    route: string
    label: string
}

const navList: NavList[] = [
    {name: "Home", route: "/home", label: "home"},
    {name: "About Us", route: "/about", label: "about"},
    {name: 'Grants', route: '/grants', label: "grants"}
]

export default function Header(){

    const [showDropDownMenu, setDropDownMenu ] = useState<boolean>(false); 

    return(
        <header className="bg-bgColor flex justify-between items-center h-16 px-8 py-8">
            <>
                <motion.div 
                initial={{opacity: 0, scale: 0}}
                whileInView={{ opacity: 1, scale: 1}}
                className="flex items-center"
            >
                <img src={logo} alt="" />
                <span className="ml-2 font-logo text-xl text-limeTxt cursor-pointer">AgriConnect</span>
            </motion.div>
            <nav className="hidden sm:block">
                <ul className="flex gap-8">
                    {
                        navList.map((item, index)=>{
                            const {name, route, label} = item;
                            return(
                                <motion.li 
                                    variants={NavAnimation(0.2*index)}
                                    initial="hidden"
                                    whileInView={"show"}
                                    key={label}
                                    className="text-white font-text"
                                >
                                    <NavLink className={({ isActive }) =>isActive ? "text-limeTxt font-bold border-b-2 border-limeTxt" : "hover:text-limeTxt transition"} to={route}>
                                        {name}
                                    </NavLink>
                                </motion.li>
                            )
                        })
                    }
                </ul>
            </nav>
            <motion.button 
                variants={NavAnimation(0.5)}
                initial="hidden"
                whileInView={"show"}
                className="bg-limeTxt px-8 py-2 text-bgColor rounded-tl-3xl font-text font-semibold cursor-pointer rounded-br-3xl hidden sm:block"
            >
                Sign up
            </motion.button>
            </>

            {/* SMALLER SCREENS - HAMBURGER & NAVLIST*/}
            <div className="sm:hidden">
                { showDropDownMenu ? 
                    <LiaTimesSolid className="text-3xl text-white cursor-pointer" onClick={() => setDropDownMenu(prevState => !prevState)}/>:
                    <RxHamburgerMenu className="text-3xl text-white cursor-pointer" onClick={() => setDropDownMenu(prevState => !prevState)}/>
                }
                <AnimatePresence>
                    {
                        showDropDownMenu && 
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                className="absolute top-20 right-4 rounded-2xl w-[90vw] sm:w-[25rem] h-auto z-10 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{scale: 0.9, opacity: 0}}
                                    animate={{scale: 1, opacity: 1}}
                                    exit={{scale: 0.9, opacity: 0}}
                                    transition={{ type: "spring", stiffness: 200, damping: 25}} 
                                    className="font-semibold uppercase dropdown-div text-white py-10 m-6 rounded-3xl"
                                >
                                        <ul className="flex flex-col justify-center items-center gap-6 font-inter">
                                            {
                                                navList.map(navs =>{
                                                    const { name, route, label } = navs;
                                                    return(
                                                        <li key={label} className="font-text">
                                                            <NavLink className={({ isActive }) =>isActive ? "text-limeTxt font-bold border-b-2 border-limeTxt" : "hover:text-limeTxt transition"}  to={route}>
                                                                {name}
                                                            </NavLink>
                                                        </li>
                                                    )
                                                })
                                            }
                                            <button className="bg-limeTxt px-8 py-2 text-bgColor rounded-tl-3xl font-text font-semibold cursor-pointer rounded-br-3xl">
                                                Sign up
                                            </button>
                                        </ul>     
                                </motion.div>
                                       
                                    

                        </motion.div>
                    }  
                </AnimatePresence>      
            </div>
        </header>
    )
}