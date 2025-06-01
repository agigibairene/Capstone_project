import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { AnimatePresence, motion } from 'framer-motion';
import { NavAnimation } from "./animations";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";


interface NavList{
    name: string
    route: string
    label: string
}

const navList: NavList[] = [
    {name: "Home", route: "/home", label: "gome"},
    {name: "About Us", route: "/about", label: "about"},
    {name: 'Grants', route: '/grants', label: "grants"}
]

export default function Header(){

    const [showDropDownMenu, setDropDownMenu ] = useState<boolean>(false); 

    return(
        <header className="bg-bgColor flex justify-between items-center h-16 px-8 py-2">
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
                                    key={route}
                                    className="text-white"
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
                className="bg-limeTxt px-8 py-2 text-bgColor rounded-tl-3xl font-semibold cursor-pointer rounded-br-3xl hidden sm:block"
            >
                Sign up
            </motion.button>
            </>

            {/* SMALLER SCREENS - HAMBURGER & NAVLIST*/}
            <div className="sm:hidden">
                <RxHamburgerMenu className="text-3xl text-white cursor-pointer" onClick={() => setDropDownMenu(prevState => !prevState)}/>
                <AnimatePresence mode="wait">
                    {
                        showDropDownMenu && 
                            <motion.div
                                initial={{opacity: 0, y: -100}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -100}}
                                className="absolute top-20 left-0 w-full h-screen z-10"
                            >
                                <div className="font-semibold uppercase dropdown-div text-white py-10 m-6 rounded-3xl">
                                        <ul className="flex flex-col justify-center items-center gap-6 font-inter">
                                            {
                                                navList.map(navs =>{
                                                    const { name, route, label } = navs;
                                                    return(
                                                        <li key={route}>
                                                            <NavLink className={({isActive})=> isActive ? "px-4 py-2 rounded-full text-white active" : ""}  to={route}>
                                                                {name}
                                                            </NavLink>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>

                        </motion.div>
                    }  
                </AnimatePresence>      
            </div>
        </header>
    )
}