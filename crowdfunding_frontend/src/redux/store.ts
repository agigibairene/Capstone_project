import { configureStore } from '@reduxjs/toolkit';
import { projectReducer } from './web3Contract';



const store = configureStore({
    reducer: {
        projectReducer
    }
});

export default store;
export const AppDispatch = typeof store.dispatch;
export const ReturnState = ReturnType<typeof store.getState>