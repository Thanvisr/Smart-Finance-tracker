import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// Load token from localStorage on startup
const token = localStorage.getItem('token')
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, thunkAPI) => {
    try {
      const data = await authService.register(name, email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const data = await authService.login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }))
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = { _id: action.payload._id, name: action.payload.name, email: action.payload.email }
        state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = { _id: action.payload._id, name: action.payload.name, email: action.payload.email }
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
