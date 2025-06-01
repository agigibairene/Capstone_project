import Header from "../Utils/Header";
import homeImg from "../assets/home-img.png";

export default function HomePage(){
    return(
        <section className="bg-bgColor max-h-full">
            <Header />

            <div className="px-8 md:px-12 pt-12 pb-8">
                <div className="font-Outfit w-[85%] md:w-[70%]">
                    <p className="text-white text-xl md:text-3xl"><span className="text-limeTxt font-semibold text-xl md:text-5xl">AgriConnect</span> - Where Investments meets Agriculture</p>

                    <p className="mt-8 text-white">A secure digital ecosystem where farmers showcase viable projects and investors find opportunities. 
                        From farm expansion to sustainable technology adoption - funding agriculture made simple.</p>
                </div>

                <div className="mt-8 w-full flex justify-center">
                    <img
                        src={homeImg}
                        alt="Farmers and investors connecting"
                        className="h-[200px] md:h-[350px] w-auto max-w-full object-cover rounded-xl shadow-lg"
                    />
               </div>
            </div>
        </section>
    )
}