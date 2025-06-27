import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./Utils/Signup.tsx";
import Login from "./Utils/Login.tsx";
import Grants from "./components/Grants.tsx";
import LandingPage from "./components/LandingPage.tsx";
import InvestorDashboard from "./Dashboards/InvestorDashboard.tsx";
import FarmerDashboard from "./Dashboards/FarmerDashboard.tsx";
import { Provider } from 'react-redux';
import store from "./redux/store.ts";
import ProtectedRoute from "./Utils/ProtectedRoute.tsx";
import ResetPassword from "./Utils/ResetPassword.tsx";
import ForgotPassword from "./Utils/ForgetPassword.tsx";


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
    path: '/reset/:reset_id',
    element: <ResetPassword/>
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword/>
  },
  {
    path: "grants",
    element: <Grants />,
  },
  {
    path: 'investor',
    element: (
      <ProtectedRoute userRole="Investor">
        <InvestorDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: 'farmer',
    element: (
      <ProtectedRoute userRole="Farmer">
        <FarmerDashboard/>
      </ProtectedRoute>
    )
  }
]);


createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={routes} />
  </Provider>
);
