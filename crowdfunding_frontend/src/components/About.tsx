import about from '../assets/who_are_we.jpg';
import vision from '../assets/vision.jpg';
import mission from '../assets/mission.jpg';

export default function About(){
    type detailsObj = {
        title: string,
        description: string,
        image: string
    }

    const details: detailsObj[] = [
        {
            title: "Our Mission", 
            description: `To bridge the gap between innovative 
            agricultural entrepreneurs and impact-driven investors 
            through a secure, transparent digital marketplace that drives 
            sustainable agricultural development and rural economic growth.
            `, 
            image: mission
        },
        {
            title: "Who are we", 
            description: `
            We are a technology-driven agricultural finance company 
            that connects farmers, agricultural entrepreneurs, and 
            socially conscious investors through a comprehensive 
            digital ecosystem focused on security, transparency, and positive impact.
            `, 
            image: about
        },
        {
            title: "Our Vision", 
            description: `
            To become the leading global platform where every viable farming 
            initiative has access to funding and every 
            investor can contribute to building a more sustainable and food-secure world.
            `, 
            image: vision
        }
    ]

    return(     
    <section className="px-6 py-12 bg-white md:px-12 lg:px-24">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-between bg-white">
          <div>
             <button className="mb-6 px-6 py-2 bg-limeTxt text-bgColor font-Outfit font-semibold rounded-full transition">
              Who are we
            </button>
            <h2 className="text-3xl font-bold text-bgColor md:text-5xl">
              Creating a platform <br />for <span className="text-limeTxt"> investors </span>and farmers
            </h2>
            <p className="mt-4 text-gray-600 font-Outfit">
              Empowering farmers with tools, knowledge, and access for smarter and more sustainable agriculture.
              Whether it's hands-on training, field devices, or a shared digital workspace, we’re designed for continuous growth.
            </p>
           
          </div>
        </div>
        {
            details.map((card)=>{
                const { title, description, image } = card;
                return <div key={title} className="bg-bgColor font-Outfit text-white rounded-xl p-4 flex flex-col">
                        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                        <p className="text-sm mb-4">{description}</p>
                        <img
                            src={image}
                            alt="Modern Farming Tools"
                            className="rounded-xl h-48 w-full bg-cover mt-auto"
                        />
                    </div>
                })
        }
      </div>
    </section>
  );
    
}