import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "user",
  initialState: {
    data: {
      firstname: "",
      lastname: "",
      phoneNumber: "",
      country: "",
      language: "",
      about: "",
      photo: "",
      companyName: "",
      companyLogo: "",
      createdDate: "",
      contentTopics: [],
      email: "",
    },
  },
  reducers: {
    setUserData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setUserData } = profileSlice.actions;
export default profileSlice.reducer;
