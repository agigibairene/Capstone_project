import { Outlet } from "react-router-dom";
import 'react-toastify/ReactToastify.css';
import { ThirdwebProvider } from "thirdweb/react";
// import {createThirdwebClient, getContract,} from "thirdweb";
// import { defineChain } from "thirdweb/chains";

// export const client = createThirdwebClient({
//   clientId: import.meta.env.VITE_MetaMask_Key as string,
// });

// export const contract = getContract({
//   client,
//   chain: defineChain(11155111),
//   address: "0xc429bC4546330b0A41cA07C46664C1E3f2eC3f96",
// });


function App() {
  return (
    <ThirdwebProvider>
     <Outlet />
  </ThirdwebProvider>
  );
}

export default App;
