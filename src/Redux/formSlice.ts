import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
    page1: {
      name: string;
      email: string;
    };
    page2: {
      age: number;
      gender: string;
    };
    page3: {
      address: string;
      city: string;
    };
  }

  
const initialState: FormState = {
    page1: { name: '', email: '' },
    page2: { age: 0, gender: '' },
    page3: { address: '', city: '' },
  };

  
export const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
      updatePage1: (state, action: PayloadAction<FormState['page1']>) => {
        state.page1 = action.payload;
      },
      updatePage2: (state, action: PayloadAction<FormState['page2']>) => {
        state.page2 = action.payload;
      },
      updatePage3: (state, action: PayloadAction<FormState['page3']>) => {
        state.page3 = action.payload;
      },
      resetForm: () => initialState,
    },
  });

  export const { updatePage1, updatePage2, updatePage3, resetForm } = formSlice.actions;
