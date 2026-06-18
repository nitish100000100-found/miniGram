import { createRoot } from 'react-dom/client'
import "./index.css";


import { protectedLoader } from './extrafxn/loaders.js';

import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { SocketProvider } from "./context/SocketContext.jsx";

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
import AddHighlight from './pages/AddHighlight.jsx';
import LookForHighlight from './pages/LookForHighlight.jsx';
import Settings from './pages/Settings.jsx';
import BlockedUsers from './pages/BlockedUsers.jsx';
import SavedPosts from './pages/SavedPosts.jsx';
import SearchUser from './pages/SearchUser.jsx';
import Notifications from './pages/Notifications.jsx';
import FollowRequests from './pages/FollowRequests.jsx';
import SuggestedUsers from './components/SuggestedUsers.jsx';
import ShowOneLoop from './pages/ShowOneLoop.jsx';
import ExploreLoop from './pages/ExploreLoop.jsx';
import MessagesSideBar from './components/MessagesSideBar.jsx';
import ChatPage from './pages/ChatPage.jsx';

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> , loader: protectedLoader},
  {
    path: "/notifications",
    element: <Notifications />,
    loader: protectedLoader,
  },
  {
    path: "/followRequests",
    element: <FollowRequests />,
    loader: protectedLoader,
  },
  {
    path: "/suggested-users",
    element: <SuggestedUsers />,
    loader: protectedLoader,
  },
  {
    path: "/searchUser",
    element: <SearchUser />,
    loader: protectedLoader
  },
  {
    path: "/lookForHighlight/:highlightId/:storyId",
    element: <LookForHighlight />,
    loader: protectedLoader
  },
  {
    path: "/addhighlight/:storyId",
    element: <AddHighlight />,
    loader: protectedLoader
  },
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
    path: "/showOneLoop/:loopId",
    element: <ShowOneLoop />,
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
    path: "/exploreLoop",
    element: <ExploreLoop />,
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
  {
    path: "/settings",
    element: <Settings />,
    loader: protectedLoader
  },
  {
    path: "/blocked-users",
    element: <BlockedUsers />,
    loader: protectedLoader
  },
  {
    path: "/saved-posts",
    element: <SavedPosts />,
    loader: protectedLoader
  },

  {
    path: "/messages",
    element: <MessagesSideBar />,
    loader: protectedLoader
  },
  {
    path: "/chatwith/:userId",
    element: <ChatPage />,
    loader: protectedLoader
  },
  { path: "*", element: <NotFound/>, loader: protectedLoader},
]);


createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <RouterProvider router={router} />
  </SocketProvider>
);
