import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { budgetService } from '../../services/budgetService'

export const fetchBudget = createAsyncThunk(
  'budget/fetch',
  async (month, thunkAPI) => {
    try {
      return await budgetService.get(month)
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch budget')
    }
  }
)

export const setBudget = createAsyncThunk(
  'budget/set',
  async ({ month, budgetAmount }, thunkAPI) => {
    try {
      return await budgetService.set(month, budgetAmount)
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to set budget')
    }
  }
)

const budgetSlice = createSlice({
  name: 'budget',
  initialState: {
    current: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBudget.fulfilled, (state, action) => { state.loading = false; state.current = action.payload })
      .addCase(fetchBudget.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(setBudget.pending, (state) => { state.loading = true; state.error = null })
      .addCase(setBudget.fulfilled, (state, action) => {
        state.loading = false
        state.current = { ...state.current, ...action.payload }
        state.successMessage = 'Budget saved successfully!'
      })
      .addCase(setBudget.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { clearMessages } = budgetSlice.actions
export default budgetSlice.reducer
