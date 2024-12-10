import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchUserProfile } from '../slices/userProfileSlice';

const UserProfile: React.FC = () => {
    const dispatch = useAppDispatch();
    const { profile, loading } = useAppSelector((state) => state.userProfile);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Profile</h1>
            <p>{profile.name}</p>
        </div>
    );
};

export default UserProfile;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface UserProfileState {
    profile: { name: string };
    loading: boolean;
}

const initialState: UserProfileState = {
    profile: { name: '' },
    loading: false,
};

export const fetchUserProfile = createAsyncThunk('userProfile/fetchUserProfile', async () => {
    const response = await axios.get('/api/userProfile');
    return response.data;
});

const userProfileSlice = createSlice({
    name: 'userProfile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default userProfileSlice.reducer;



import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UserProfile from '../components/UserProfile';
import * as api from '../api'; // Mock the API module
import { fetchUserProfile } from '../slices/userProfileSlice';

// Mock API call
jest.mock('axios');
const mockAxios = jest.requireMock('axios');

const mockStore = configureStore([thunk]);

describe('UserProfile Component', () => {
    let store: any;

    beforeEach(() => {
        store = mockStore({
            userProfile: {
                profile: { name: '' },
                loading: false,
            },
        });
    });

    test('renders loading state', () => {
        store = mockStore({
            userProfile: {
                profile: { name: '' },
                loading: true,
            },
        });

        render(
            <Provider store={store}>
                <UserProfile />
            </Provider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders user profile after fetching', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { name: 'John Doe' } });

        // Dispatch mock actions for fulfilled state
        store = mockStore({
            userProfile: {
                profile: { name: 'John Doe' },
                loading: false,
            },
        });

        render(
            <Provider store={store}>
                <UserProfile />
            </Provider>
        );

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
    });

    test('handles API failure gracefully', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

        render(
            <Provider store={store}>
                <UserProfile />
            </Provider>
        );

        expect(await screen.findByText('Loading...')).toBeInTheDocument();
        // Additional UI handling for errors can be tested here
    });
});


