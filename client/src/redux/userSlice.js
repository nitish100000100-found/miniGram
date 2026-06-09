import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setDataUser: (state, action) => {
      state.userData = action.payload;
    },

  },
});

export const { setDataUser } = userSlice.actions;

export default userSlice.reducer;