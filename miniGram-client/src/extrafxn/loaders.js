import { redirect } from "react-router-dom";
import axios from "axios";

export const protectedLoader = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/user/current`,
      {
        withCredentials: true,
      },
    );

    return null;
  } catch (error) {
    console.error("Error in protectedLoader:", error);
    return redirect("/signin");
  }
};
