import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./Utils/Signup.tsx";
import Login from "./Utils/Login.tsx";
import Grants from "./components/Grants.tsx";
import LandingPage from "./components/LandingPage.tsx";
import InvestorDashboard from "./Dashboards/InvestorDashboard.tsx";
import Trial from "./Dashboards/Trial.tsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/about",
        element: <LandingPage />,
      },
      {
        path: "/faqs",
        element: <LandingPage />,
      },
      {
        path: "/reviews",
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/grants",
    element: <Grants />,
  },
  {
    path: 'investor',
    element: <InvestorDashboard />
    // element: <Trial/>
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
);
