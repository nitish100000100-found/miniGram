
import { createRoot } from 'react-dom/client'


import { protectedLoader } from './extrafxn/loaders.js';

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Signup from './pages/Signup.jsx';
import SignIn from './pages/SignIn.jsx';
import ForgotPass from './pages/ForgotPass.jsx';
import HomePage from './pages/HomePage.jsx';
import LookFor from './pages/LookFor.jsx';
import NotFound from "./pages/NotFound.jsx"
import MyInfo from './pages/MyInfo.jsx';

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> , loader: protectedLoader},
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPass />,
  },
  {
    path: "/lookFor/:id",
    element: <LookFor/>,
  },
  {
    path:"/myInfo",
    element:<MyInfo/>
  },

  { path: "*", element: <NotFound/>},
]);


createRoot(document.getElementById("root")).render(
 
    <RouterProvider router={router} />
 
);
