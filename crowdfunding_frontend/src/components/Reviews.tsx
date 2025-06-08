import { useEffect, useRef } from "react";

export default function Reviews() {
  const carouselRef = useRef<HTMLDivElement>(null);

  interface Review {
    name: string;
    role: string;
    rating: number;
    message: string;
    imageUrl: string;
  }

  const reviews: Review[] = [
    {
      name: "Kwame Asante",
      role: "Investor",
      rating: 5,
      message:
        "The platform made it easy to discover high-impact agricultural projects. I'm proud to support Ghanaian farmers!",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Ama Serwaa",
      role: "Farmer",
      rating: 4,
      message:
        "Thanks to the crowdfunding support, I was able to upgrade my irrigation system and increase my yields.",
      imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Nana Kofi",
      role: "Agribusiness Owner",
      rating: 5,
      message:
        "Very professional experience and transparent transactions. The investor dashboard is super helpful.",
      imageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Akosua Dapaah",
      role: "Investor",
      rating: 4,
      message:
        "Love the idea of supporting sustainable agriculture. I would love to see more local projects added soon.",
      imageUrl: "https://randomuser.me/api/portraits/women/40.jpg",
    },
    {
      name: "Yaw Owusu",
      role: "Farmer",
      rating: 5,
      message:
        "Getting funding used to be hard, but this platform opened new doors for me. Highly recommended!",
      imageUrl: "https://randomuser.me/api/portraits/men/18.jpg",
    },
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

  return (
    <div className="pt-14">
      <div className="container mx-auto px-4">
        <div className="text-left mb-10 max-w-[600px]">
          <h1 className="text-3xl md:text-4xl font-bold text-bgColor">Read Our impact Stories</h1>
          <p className="text-gray-600 mt-2">
            Hear what our community of investors and farmers are saying.
          </p>
        </div>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto no-scrollbar space-x-6 md:h-[250px]"
        >
          {reviews.concat(reviews).map((author, index) => {
            const { imageUrl, name, role, message } = author;
            const isGreen = index % 2 === 0;

            return (
              <div
                key={index}
                className={`
                  min-w-[350px] sm:min-w-[300px] md:min-w-[320px] h-[200px]
                  flex flex-col justify-between rounded-2xl p-6
                  transition-transform duration-300 ease-in-out transform
                  hover:-translate-y-2 review-shadow mt-2
                  ${isGreen ? "bg-bgColor text-white" : "bg-white text-gray-900"}
                    border border-gray-200 
                `}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-limeTxt">{name}</p>
                    <p className={`text-sm ${isGreen ? "text-gray-200" : "text-gray-500"}`}>{role}</p>
                  </div>
                </div>

                <div className={`mt-4 text-sm line-clamp-5 ${isGreen ? "text-gray-100" : "text-gray-700"}`}>{message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}