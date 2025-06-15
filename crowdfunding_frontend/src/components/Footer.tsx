import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { FaInstagram, FaLinkedinIn, FaPhoneAlt, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { navList, type RefProps } from "../Utils/Header";
import { Link } from "react-router-dom";



export default function Footer({refs} : RefProps) {

    const scrollToSection = (label: keyof RefProps["refs"]) => {
        const elementRef = refs[label];
        if (elementRef && elementRef.current) {
            window.scrollTo({
                top: elementRef.current.offsetTop - 50 , 
                behavior: 'smooth'
            });
        }
    };
    
    const iconStyle ="p-2 bg-gray-950 text-white rounded-md cursor-pointer hover:text-limeTxt";
    
    return (
        <footer className=" text-white bg-bgColor font-Outfit py-11 px-6 md:px-20 rounded-tl-3xl rounded-tr-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <IoLocationOutline size={40} className="p-2 bg-gray-950 text-white rounded-full hover:text-limeTxt cursor-pointer" />
                        <p className="text-gray-300">
                            African Leadership University
                            <span className="block">Kigali, Rwanda</span>
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <FaPhoneAlt size={40} className="p-2 bg-gray-950 text-white rounded-full cursor-pointer hover:text-limeTxt" />
                        <p className="text-gray-300">+233 54 477 9048</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <MdOutlineMail size={40} className="p-2 hover:text-limeTxt bg-gray-950 text-white rounded-full cursor-pointer" />
                        <p className="text-gray-300">i.agigiba@alustudent.com</p>
                    </div>
                </div>

                <div className="">
                    <p className="font-bold text-xl text-limeTxt">Agriconnect</p>
                    <ul>
                        {
                            navList.map(item =>{
                                const {name, route, label} = item;
                                return (
                                    <li 
                                        onClick={()=>scrollToSection(label as 'home' | 'about' | 'reviews' | 'faqs')}
                                        className="text-gray-300" key={route}
                                    >
                                        <Link to={label} className="hover:text-limeTxt">{name}</Link>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div className="space-y-4">
                    <p className="font-bold text-xl text-limeTxt">About Agriconnect</p>
                    <p className="text-gray-300 max-w-lg">
                        Empowering agriculture, this platform connects farmers with investors, 
                        facilitating secure funding for sustainable growth. It offers robust project screening,
                        detailed documentation, and ongoing monitoring to ensure transparency and trust, 
                        fostering a vital community for agricultural advancement
                    </p>
                    <div className="flex gap-4">
                        <FaInstagram size={35} className={iconStyle} />
                        <FaLinkedinIn size={35} className={iconStyle} />
                        <FaXTwitter size={35} className={iconStyle} />
                        <FaFacebookF size={35} className={iconStyle}/>
                    </div>
                </div>
            </div>
        </footer>
    );
}