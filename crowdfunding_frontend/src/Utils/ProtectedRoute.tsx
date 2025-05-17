// // src/components/auth/ProtectedRoute.jsx
// import { useEffect,useState, type ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { isAuthenticated } from './Auth';


// interface ProtectInterface{
//     children : ReactNode
// }

// const ProtectedRoute = ({ children} : ProtectInterface) => {
//   const navigate = useNavigate();
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const checkAuth = async () => {
//       if (!isAuthenticated()) {
//         navigate('/login');
//         return;
//       }


//       setIsAuthorized(true);
//     };

//     checkAuth();
//   }, [navigate, allowedRoles]);

//   if (!isAuthorized) {
//     return <div>Loading...</div>;
//   }

//   return children;
// };

// export default ProtectedRoute;