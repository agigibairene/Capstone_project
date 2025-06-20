import image from '../assets/dp.jpg';

export default function InvestorMainContent(){
    return(
        <div>
            <div className="bg-white/20 backdrop-blur-sm  w-[28rem]  rounded-2xl p-6 border border-white/30">
                <div className="flex gap-2 items-center space-x-3">
                    <div className=" bg-purple-100 rounded-full flex items-center justify-center">
                        <img src={image} className="w-[8rem] h-[8rem] rounded-full" alt="" />
                    </div>
                    <div>
                        <p className="text-xl text-limeTxt tracking-wide mb-3">Agigiba Irene Akawin</p>
                        <p className="text-md mb-1 text-limeTxt tracking-wide">i.agigiba@alustudent.com</p>
                        <p className="text-md mb-1 text-white">Gender: Female</p>
                        <p className="text-md mb-1 text-white">+233550267598</p>
                        <p className="text-md mb-1 text-white">Accra, Ghana</p>

                    </div>
                </div>
            </div>
        </div>
    )
}