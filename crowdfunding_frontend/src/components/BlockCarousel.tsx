import { useEffect, useRef } from "react"

export default function BlockCarousel(){
    const carouselRef = useRef<HTMLDivElement>(null);
    
    const words: string[] = [
        "Funding", "Farming", "Investments", "Agriculture"
    ];
    
    useEffect(() => {
        const scrollContainer = carouselRef.current;
        if (scrollContainer) {
            let scrollAmount = 0;
            const speed = 1;
            const scrollStep = () => {
                if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                scrollContainer.scrollLeft = 0;
                scrollAmount = 0;
                } else {
                scrollContainer.scrollLeft += speed;
                scrollAmount += speed;
                }
            };
            const interval = setInterval(scrollStep, 30);
            return () => clearInterval(interval);
        }
    }, []);

    return(
        <div ref={carouselRef} className="flex overflow-x-auto no-scrollbar font-text mt-4 space-x-6 pb-3">           
           {
                [...words,...words].map((word, index)=>
                    <div key={index} className="text-5xl md:text-6xl font-extrabold text-transparent stroke-black">
                        {word}
                    </div>
                )
            }
      </div>
    )
}