import { configureStore } from '@reduxjs/toolkit';
import { projectReducer } from './web3Contract';
import { loginReducer } from './login_auth';
import { signupReducer } from './signup_auth';
import {  kycReducer } from './KycSlice';


const store = configureStore({
    reducer: {
        projectReducer,
        loginReducer,
        signupReducer,
        kycReducer,
    }
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>
