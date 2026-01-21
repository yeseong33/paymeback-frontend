import api from './config';

export const expenseAPI = {
  create: (expenseData) => {
    return api.post('/expenses', expenseData);
  },

  getExpense: (expenseId) => {
    return api.get(`/expenses/${expenseId}`);
  },

  getExpensesByGathering: (gatheringId) => {
    return api.get(`/expenses/gathering/${gatheringId}`);
  },

  delete: (expenseId) => {
    return api.delete(`/expenses/${expenseId}`);
  }
};
