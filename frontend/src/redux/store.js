import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import budgetReducer from './slices/budgetSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
  },
})
