import API from './api'

export const aiService = {
  categorize: async (description) => {
    const res = await API.post('/ai/categorize', { description })
    return res.data
  },

  getInsights: async (transactions, month) => {
    const res = await API.post('/ai/insights', { transactions, month })
    return res.data
  },
}
