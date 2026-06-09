import { redirect } from "react-router-dom";
import axios from "axios";
import store from "../redux/store.js";
import { setDataUser } from "../redux/userSlice.js";




export const protectedLoader = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/user/current`,
      {
        withCredentials: true,
      }
    );

    store.dispatch(setDataUser(res.data.user));

    return null;
  } catch (error) {
    console.error("Error in protectedLoader:", error);
    return redirect("/signin");
  }
};














 
