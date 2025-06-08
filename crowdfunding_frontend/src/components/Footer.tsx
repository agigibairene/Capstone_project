import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { FaInstagram, FaLinkedinIn, FaPhoneAlt, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
    const iconStyle ="p-2 bg-gray-950 text-white rounded-md cursor-pointer hover:bg-limeTxt";
    return (
        <footer className=" text-white bg-bgColor font-Outfit py-11 px-6 md:px-20 rounded-tl-3xl rounded-tr-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <IoLocationOutline size={40} className="p-2 bg-gray-950 text-white rounded-full cursor-pointer" />
                        <p className="text-gray-300">
                            African Leadership University
                            <span className="block">Kigali, Rwanda</span>
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <FaPhoneAlt size={40} className="p-2 bg-gray-950 text-white rounded-full cursor-pointer" />
                        <p className="text-gray-300">+233 54 477 9048</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <MdOutlineMail size={40} className="p-2 bg-gray-950 text-white rounded-full cursor-pointer" />
                        <p className="text-gray-300">agigiba@gmail.com</p>
                    </div>
                </div>

                {/* About Section */}
                <div className="space-y-4">
                    <p className="font-bold text-xl text-limeTxt">About Agriconnect</p>
                    <p className="text-gray-300 max-w-lg">
                        Discover your next favorite book with ease! Our platform connects readers with a vast collection of titles, offering personalized recommendations and seamless browsing to spark your literary journey.
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