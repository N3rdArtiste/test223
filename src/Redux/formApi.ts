import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface FormData {
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

export const formApi = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/' }), // Adjust the base URL as needed
  endpoints: (builder) => ({
    fetchForm: builder.query<FormData, void>({
      query: () => 'form', // GET /api/form
    }),
    updateForm: builder.mutation<void, Partial<FormData>>({
      query: (formData) => ({
        url: 'form', // POST /api/form
        method: 'POST',
        body: formData,
      }),
    }),
    submitForm: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: 'form/submit', // POST /api/form/submit
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { useFetchFormQuery, useUpdateFormMutation, useSubmitFormMutation } = formApi;
