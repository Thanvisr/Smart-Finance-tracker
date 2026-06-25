import API from './api'

export const budgetService = {
  get: async (month) => {
    const res = await API.get('/budget', { params: { month } })
    return res.data
  },

  set: async (month, budgetAmount) => {
    const res = await API.post('/budget', { month, budgetAmount })
    return res.data
  },

  getAll: async () => {
    const res = await API.get('/budget/all')
    return res.data
  },
}
