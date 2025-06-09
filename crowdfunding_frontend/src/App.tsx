import About from "./components/About";
import HomePage from "./components/HomePage";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from "./components/Footer";
import Reviews from "./components/Reviews";
import ScrollToTop from "react-scroll-to-top";
import { FaArrowUp } from "react-icons/fa";
import FAQSection from "./components/FAQSection";



function App() {
  return (
    <>
      <HomePage />
      <About />
      <FAQSection />
      <Reviews />
      <ScrollToTop
        smooth
        className="scrollToTop"        
        component={<FaArrowUp className="animate-arrow text-bgColor" style={{ fontSize: "20px", color: "" }} />}
      />
      <Footer />
    </>
  );
}

export default App;