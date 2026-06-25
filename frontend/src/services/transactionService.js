import API from './api'

export const transactionService = {
  getAll: async (params = {}) => {
    const res = await API.get('/transactions', { params })
    return res.data
  },

  getSummary: async () => {
    const res = await API.get('/transactions/summary')
    return res.data
  },

  create: async (data) => {
    const res = await API.post('/transactions', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await API.put(`/transactions/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await API.delete(`/transactions/${id}`)
    return res.data
  },
}
