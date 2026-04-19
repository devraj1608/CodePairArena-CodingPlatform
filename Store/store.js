import {configureStore} from '@reduxjs/toolkit'
import socketReducer from '../Features/storeSlice'

const store=configureStore({
    reducer: {
        socket: socketReducer,
    }
});

export default store;