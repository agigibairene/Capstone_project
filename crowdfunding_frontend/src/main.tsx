import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './Utils/Signup.tsx';
import Login from './Utils/Login.tsx';
import HomePage from './components/HomePage.tsx';
import About from './components/About.tsx';
import FAQSection from './components/FAQSection.tsx';
import Reviews from './components/Reviews.tsx';
import Grants from './components/Grants.tsx';
import JobSearchApp from './components/Jobs.tsx';


const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: '/faqs',
        element: <FAQSection />
      },
      {
        path: "/reviews",
        element: <Reviews />
      }
    ]
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/grants',
    // element: <Grants />
    element: <JobSearchApp />
  }

])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes}/>
  </StrictMode>,
)
