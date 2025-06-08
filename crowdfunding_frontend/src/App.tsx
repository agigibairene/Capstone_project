import About from "./components/About";
import HomePage from "./components/HomePage";
import 'bootstrap-icons/font/bootstrap-icons.css';
import KnowMore from "./components/KnowMore";
import Footer from "./components/Footer";
import Reviews from "./components/Reviews";

function App() {
  return (
    <>
      <HomePage />
      <About />
      <KnowMore />
      <Reviews />
      <Footer />
    </>
  );
}

export default App;