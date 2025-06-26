import { configureStore } from '@reduxjs/toolkit';
import { projectReducer } from './web3Contract';
import { loginReducer } from './login_auth';
import { signupReducer } from './signup_auth';



const store = configureStore({
    reducer: {
        projectReducer,
        loginReducer,
        signupReducer
    }
});

export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>
