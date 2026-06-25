import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { transactionService } from '../../services/transactionService'

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, thunkAPI) => {
    try {
      return await transactionService.getAll(params)
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const fetchSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async (_, thunkAPI) => {
    try {
      return await transactionService.getSummary()
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch summary')
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data, thunkAPI) => {
    try {
      return await transactionService.create(data)
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create transaction')
    }
  }
)

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }, thunkAPI) => {
    try {
      return await transactionService.update(id, data)
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update transaction')
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, thunkAPI) => {
    try {
      await transactionService.delete(id)
      return id
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete transaction')
    }
  }
)

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    list: [],
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTransactions.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      // Summary
      .addCase(fetchSummary.fulfilled, (state, action) => { state.summary = action.payload })
      // Create
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      // Update
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      // Delete
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t._id !== action.payload)
      })
  },
})

export const { clearError } = transactionSlice.actions
export default transactionSlice.reducer
