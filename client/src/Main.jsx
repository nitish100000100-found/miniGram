
import { createRoot } from 'react-dom/client'
import  store from "./redux/store.js";
import { Provider } from "react-redux";
import { protectedLoader } from './extrafxn/loaders.js';

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Signup from './pages/Signup.jsx';
import SignIn from './pages/SignIn.jsx';
import ForgotPass from './pages/ForgotPass.jsx';
import HomePage from './pages/HomePage.jsx';

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
  { path: "*", element: <h1>404 Not Found</h1> },
]);


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
