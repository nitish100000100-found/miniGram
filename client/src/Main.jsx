import { createRoot } from 'react-dom/client'
import "./index.css";


import { protectedLoader } from './extrafxn/loaders.js';

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Signup from './pages/Signup.jsx';
import SignIn from './pages/SignIn.jsx';
import ForgotPass from './pages/ForgotPass.jsx';
import HomePage from './pages/HomePage.jsx';
import LookFor from './pages/LookFor.jsx';
import NotFound from "./pages/NotFound.jsx"
import MyInfo from './pages/MyInfo.jsx';
import EditProfile from './pages/EditProfile.jsx';
import AddStory from './pages/AddStory.jsx';
import LookForStory from './pages/LookForStory.jsx';
import AddPost from './pages/AddPost.jsx';
import LookFollowing from './pages/LookFollowing.jsx';
import LookFollowers from './pages/LookFollowers.jsx';
import ExplorePost from './pages/ExplorePost.jsx';
import SeeWhoLiked from './pages/SeeWhoLiked.jsx';
import CommentPage from './pages/CommentPage.jsx';

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
    loader: protectedLoader
  },
  {
    path:"/myInfo",
    element:<MyInfo/>,
    loader: protectedLoader
  },
  {
    path:"/editProfile",
    element:<EditProfile/>,
    loader: protectedLoader
  },
  {
    path: "/addStory/:userId",
    element: <AddStory />,
    loader: protectedLoader
  },
  {
    path: "/addPost",
    element: <AddPost />,
    loader: protectedLoader
  },
  {
    path: "/lookForStory/:storyId",
    element: <LookForStory />,
    loader: protectedLoader
  },
  {
    path: "/lookfollowing/:id",
    element: <LookFollowing />,
    loader: protectedLoader
  },
  {
    path: "/lookfollowers/:id",
    element: <LookFollowers />,
    loader: protectedLoader
  },
  {
    path: "/explorePost",
    element: <ExplorePost />,
    loader: protectedLoader
  },
  {
    path: "/seeWhoLiked/:postId",
    element: <SeeWhoLiked />,
    loader: protectedLoader
  },
  {
    path: "/commentpage/:postId",
    element: <CommentPage />,
    loader: protectedLoader
  },

  { path: "*", element: <NotFound/>, loader: protectedLoader},
]);


createRoot(document.getElementById("root")).render(
 
    <RouterProvider router={router} />
 
);
