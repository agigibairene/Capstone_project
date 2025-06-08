import About from "./components/About";
import HomePage from "./components/HomePage";
import 'bootstrap-icons/font/bootstrap-icons.css';
import KnowMore from "./components/KnowMore";
import Footer from "./components/Footer";
import Reviews from "./components/Reviews";
import ScrollToTop from "react-scroll-to-top";
import { FaArrowUp } from "react-icons/fa";



function App() {
  return (
    <>
      <HomePage />
      <About />
      <KnowMore />
      <Reviews />
      <ScrollToTop
        smooth
        className="scrollToTop"
        // style={{backgroundColor:"#9333ea"}}
        
        component={<FaArrowUp className="animate-arrow text-bgColor" style={{ fontSize: "20px", color: "" }} />}
      />
      <Footer />
    </>
  );
}

export default App;