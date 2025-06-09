import About from "./components/About";
import HomePage from "./components/HomePage";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from "./components/Footer";
import Reviews from "./components/Reviews";
import ScrollToTop from "react-scroll-to-top";
import { FaArrowUp } from "react-icons/fa";
import FAQSection from "./components/FAQSection";
import { useRef } from "react";
import Header from "./Utils/Header";



function App() {

  const home = useRef<HTMLDivElement|null>(null);
  const about = useRef<HTMLDivElement|null>(null);
  const reviews = useRef<HTMLDivElement|null>(null);
  const faqs = useRef<HTMLDivElement|null>(null);

  const refs = {home, about, reviews, faqs}


  return (
    <>
      <Header refs={refs}/>
      <div ref={home}><HomePage/></div>
      <div ref={about}><About /></div>
      <div ref={faqs}><FAQSection /></div>
      <div ref={reviews}><Reviews /></div>
      <ScrollToTop
        smooth
        className="scrollToTop"        
        component={<FaArrowUp className="animate-arrow text-bgColor" style={{ fontSize: "20px", color: "" }} />}
      />
      <Footer refs={refs}/>
    </>
  );
}

export default App;