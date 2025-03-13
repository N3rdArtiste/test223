//openapi-config.ts
import type { ConfigFile } from '@rtk-query/codegen-openapi'

export default {
  schemaFile:     '.json',
  apiFile:        '../src/api/apiBase.ts',
  outputFile:     '../src/api/api.ts',
  apiImport:      'apiBase',
  exportName:     'api',
  hooks:          true,
  argSuffix:      'Request',
  responseSuffix: 'Result'
} satisfies ConfigFile


//apiExtensions.ts

import { api } from './api'

api.enhanceEndpoints({
    endpoints: {
      testSearch: {
        providesTags(r, e, { }) {
          return ['test']
        }
      },
      testCreate: {
        invalidatesTags(r, e, { }) {
          return ['test']
        }
      }})


//QueryLoading

import { Box, CircularProgress, Typography } from '@mui/material'
import { Func2 } from '@reduxjs/toolkit'
import { map } from 'lodash-es'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type Query<T> = {
  data?: T
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  isSuccess: boolean
  error?: unknown
}

type State = {
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  dataChangedCount: number
}

type Props<
  Q extends Record<string, Query<any>>,
  Data = { [K in keyof Q]: Q[K] extends Query<infer Q> ? Q : never }
> = {
  disableLoadFailed?: boolean
  query: Q
  trackDataChange?: boolean
  dataChangeIgnore?: (keyof Q)[]
  children: Func2<Data, State, React.ReactNode>
  onSuccess?: (data: Data) => void
  renderLoading?: () => React.ReactNode
  renderFailed?: () => React.ReactNode
}

export function QueryLoading<Q extends Record<string, Query<any>>>({
  disableLoadFailed,
  query,
  trackDataChange,
  dataChangeIgnore = [],
  children,
  onSuccess,
  renderLoading,
  renderFailed
}: Props<Q>) {

  const { data, isLoading, isFetching, isSuccess, isError, error } = map(query, (v, k) => ({
    k,
    v
  })).reduce(
    (r, { k, v }) => {
      r.isLoading = v.isLoading ? true : r.isLoading
      r.isFetching = v.isFetching ? true : r.isFetching
      r.isSuccess = !v.isSuccess ? false : r.isSuccess
      r.isError = v.isError ? true : r.isError
      r.error = v.isError ? v.error : r.error
      r.data[k as keyof Q] = v.data!
      return r
    },
    {
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: null as unknown,
      data: {} as Record<keyof Q, any>
    }
  )

  const dataChangedCountRef = useRef(0)

  const prevData = useRef<{ [K in keyof Q]: Q[K] extends Query<infer Q> ? Q : never }>()

  const dataChangedCount = useMemo(() => {
    if (!trackDataChange) return dataChangedCountRef.current

    let dataChanged = false

    if (prevData.current) {
      for (var key in data) {
        if (dataChangeIgnore.includes(key)) continue

        const item = data[key]

        if (item !== prevData.current[key]) {
          prevData.current[key] = item
          dataChanged = true
        }
      }
    }
    prevData.current = data

    if (dataChanged) {
      dataChangedCountRef.current++
    }

    return dataChangedCountRef.current
  }, [trackDataChange, data])

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.(data)
    }
  }, [isSuccess])

  return (
    <>
      {isLoading ? (
        renderLoading?.() || (
          <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          </Box>
        )
      ) : isSuccess && !isError ? (
        children(data!, { isLoading, isFetching, isSuccess, dataChangedCount })
      ) : (
        renderFailed?.() || (!disableLoadFailed && <Typography children='Failed to load data' />)
      )}
    </>
  )
}

