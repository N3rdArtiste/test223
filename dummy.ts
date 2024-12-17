import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import queryString from 'query-string'

import { AppRootState } from '@/redux/store'

//Set paths that should be proxied to the local backend (only works on dev, and you need your env set up correctly)
const getProxyPaths = (user: any) => {
  return [
    // `/vendors`,
    // `/vendors/by`,
    // `/vendors/_/programmes`,
    // `/users/_/permissions`,
    // `/vendors/_/preferredPlant`,
    // `/regions/_/vendors`,
    // `/companies/_/vendors`,
    `/regions/_/vendors`,
    `/download`
  ]
}

const useBackendApiRoutes = (args: FetchArgs, user: any) => {
  let useBackend = false
  if (import.meta.env.DEV) {
    if (args.url !== undefined) {
      // console.log(user,args.url);
      getProxyPaths(user).every(p => {
        //allow dyanmic paths...
        let url = args.url
        //let replacedStr = url.replace(/\/\d+\//, '/_/');

        //console.log(p,replacedStr,(replacedStr == p));
        //if (replacedStr == p) {
        useBackend = true
        return false
        //}
        return true
      })
    }
    // if (useBackend) {
    //   console.log("using proxy to local backend for: ", args.url)
    // }
  }
  return useBackend
}

const dynamicBaseQuery: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  WebApi,
  extraOptions
) => {
  const { user } = (WebApi.getState() as AppRootState).auth
  const useBackendProxy = useBackendApiRoutes(args, user) // Assuming backendApiRoutes is the function you want to use

  const baseUrl =
    useBackendProxy && import.meta.env.VITE_PROXY_URL
      ? import.meta.env.VITE_PROXY_URL
      : import.meta.env.VITE_API_URL

  const response = await fetchBaseQuery({
    baseUrl,
    prepareHeaders(headers, { getState }) {
      const { user } = (getState() as AppRootState).auth
      if (user) {
        headers.set('Authorization', `Bearer ${user.token}`)
      }
      return headers
    },
    paramsSerializer(params) {
      return queryString.stringify(params)
    },
    async fetchFn(input, init) {
      const response = await fetch(input, init)
      const clonedResponse = response.clone()
      if (clonedResponse.headers.get('Content-Type') === 'application/pdf') {

        const contentDisposition = clonedResponse.headers.get('Content-Disposition');
        let filename = 'download.pdf'

        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const objectUrl = URL.createObjectURL(await clonedResponse.blob());
    
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', filename); // Default filename if Content-Disposition is not available
        link.style.display = 'none';
    
        document.body.appendChild(link);
        link.click();
    
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        return new Response();
      }
      return response
    }
  })(args, WebApi, extraOptions)

  return response
}

export const apiBase = createApi({
  baseQuery: dynamicBaseQuery,
  endpoints: () => ({}),
  tagTypes: [
    'Events',
    'AnnualCommitment',
    'Bookings',
    'BookingComments',
    'ProcessingTimes',
    'PlantShiftCapacities',
    'Vendor',
    'Agent',
    'VendorSupportUsers'
  ]
})
