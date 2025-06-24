import { configureStore } from '@reduxjs/toolkit';



const store = configureStore({
    reducer: {

    }
});

export default store;
export const AppDispatch = typeof store.dispatch;
export const ReturnState = ReturnType<typeof store.getState>