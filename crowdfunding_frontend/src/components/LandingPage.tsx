import ScrollToTop from "react-scroll-to-top";
import About from "./About";
import FAQSection from "./FAQSection";
import HomePage from "./HomePage";
import Reviews from "./Reviews";
import Header from "../Utils/Header";
import { FaArrowUp } from "react-icons/fa";
import Footer from "./Footer";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function LandingPage() {
  // Properly type the refs as HTMLDivElement
  const home = useRef<HTMLDivElement>(null!);
  const about = useRef<HTMLDivElement>(null!);
  const reviews = useRef<HTMLDivElement>(null!);
  const faqs = useRef<HTMLDivElement>(null!);

  const location = useLocation();

  const refs = {
    home,
    about,
    reviews,
    faqs,
  };

  useEffect(() => {
    const path = location.pathname;

    const scrollMap: Record<string, React.RefObject<HTMLDivElement>> = {
      "/": home,
      "/about": about,
      "/reviews": reviews,
      "/faqs": faqs,
    };

    const scrollTo = scrollMap[path];

    if (scrollTo?.current) {
      window.scrollTo({
        top: scrollTo.current.offsetTop - 90,
        behavior: "smooth",
      });
    }
  }, [location.pathname]);

  const scrollToSection = (name: keyof typeof refs) => {
    const elementRef = refs[name];
    if (elementRef?.current) {
      window.scrollTo({
        top: elementRef.current.offsetTop - 90,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <Header refs={refs} scrollToSection={scrollToSection} />
      <div ref={home}>
        <HomePage />
      </div>
      <div ref={about}>
        <About />
      </div>
      <div ref={faqs}>
        <FAQSection />
      </div>
      <div ref={reviews}>
        <Reviews />
      </div>
      <ScrollToTop
        smooth
        className="scrollToTop"
        component={
          <FaArrowUp
            className="animate-arrow text-bgColor"
            style={{ fontSize: "20px" }}
          />
        }
      />
      <Footer refs={refs} scrollToSection={scrollToSection} />
    </>
  );
}
