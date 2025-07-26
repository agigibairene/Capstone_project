import { Outlet } from "react-router-dom";
import 'react-toastify/ReactToastify.css';
import { ThirdwebProvider } from "thirdweb/react";



function App() {
  return (
    <ThirdwebProvider>
     <Outlet />
  </ThirdwebProvider>
  );
}

export default App;
