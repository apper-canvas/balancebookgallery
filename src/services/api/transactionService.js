import { getApperClient } from "@/services/apperClient";

export const transactionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Transaction_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{
          "fieldName": "date_c",
          "sorttype": "DESC"
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to expected format
      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name,
        amount: item.amount_c,
        date: item.date_c,
        description: item.description_c,
        notes: item.notes_c,
        type: item.type_c,
        category: item.category_c?.Name || ''
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('Transaction_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      const item = response.data;
      return {
        Id: item.Id,
        name: item.Name,
        amount: item.amount_c,
        date: item.date_c,
        description: item.description_c,
        notes: item.notes_c,
        type: item.type_c,
        category: item.category_c?.Name || ''
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Transaction_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "date_c",
          "Operator": "StartsWith",
          "Values": [month]
        }],
        orderBy: [{
          "fieldName": "date_c",
          "sorttype": "DESC"
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name,
        amount: item.amount_c,
        date: item.date_c,
        description: item.description_c,
        notes: item.notes_c,
        type: item.type_c,
        category: item.category_c?.Name || ''
      }));
    } catch (error) {
      console.error(`Error fetching transactions for month ${month}:`, error?.response?.data?.message || error);
      return [];
    }
  },

  async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Transaction_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [{
            "conditions": [{
              "fieldName": "category_c",
              "operator": "EqualTo",
              "values": [category]
            }]
          }]
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(item => ({
        Id: item.Id,
        name: item.Name,
        amount: item.amount_c,
        date: item.date_c,
        description: item.description_c,
        notes: item.notes_c,
        type: item.type_c,
        category: item.category_c?.Name || ''
      }));
    } catch (error) {
      console.error(`Error fetching transactions for category ${category}:`, error?.response?.data?.message || error);
      return [];
    }
  },

  async create(transactionData) {
    try {
      const apperClient = getApperClient();
      
      // First, get the category ID by name
      const categoryResponse = await apperClient.fetchRecords('Category_c', {
        fields: [{"field": {"Name": "Name"}}],
        where: [{
          "FieldName": "Name",
          "Operator": "EqualTo",
          "Values": [transactionData.category]
        }]
      });
      
      if (!categoryResponse.success || !categoryResponse.data.length) {
        throw new Error("Category not found");
      }
      
      const categoryId = categoryResponse.data[0].Id;
      
      const response = await apperClient.createRecord('Transaction_c', {
        records: [{
          Name: transactionData.description || 'Transaction',
          amount_c: transactionData.amount,
          date_c: transactionData.date.split('T')[0], // Convert to date only
          description_c: transactionData.description,
          notes_c: transactionData.notes,
          type_c: transactionData.type,
          category_c: categoryId
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        const item = response.results[0].data;
        return {
          Id: item.Id,
          name: item.Name,
          amount: item.amount_c,
          date: item.date_c,
          description: item.description_c,
          notes: item.notes_c,
          type: item.type_c,
          category: transactionData.category
        };
      }
      
      throw new Error("Failed to create transaction");
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      
      let categoryId = null;
      if (transactionData.category) {
        const categoryResponse = await apperClient.fetchRecords('Category_c', {
          fields: [{"field": {"Name": "Name"}}],
          where: [{
            "FieldName": "Name",
            "Operator": "EqualTo",
            "Values": [transactionData.category]
          }]
        });
        
        if (categoryResponse.success && categoryResponse.data.length) {
          categoryId = categoryResponse.data[0].Id;
        }
      }
      
      const updateData = {
        Id: parseInt(id),
        Name: transactionData.description || 'Transaction',
        amount_c: transactionData.amount,
        date_c: transactionData.date.split('T')[0],
        description_c: transactionData.description,
        notes_c: transactionData.notes,
        type_c: transactionData.type
      };
      
      if (categoryId) {
        updateData.category_c = categoryId;
      }
      
      const response = await apperClient.updateRecord('Transaction_c', {
        records: [updateData]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        const item = response.results[0].data;
        return {
          Id: item.Id,
          name: item.Name,
          amount: item.amount_c,
          date: item.date_c,
          description: item.description_c,
          notes: item.notes_c,
          type: item.type_c,
          category: transactionData.category
        };
      }
      
      throw new Error("Transaction not found");
    } catch (error) {
      console.error(`Error updating transaction ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('Transaction_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        return true;
      }
      
      throw new Error("Transaction not found");
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async getIncomeExpenseTrend(months) {
    try {
      const trendData = [];
      
      for (const month of months) {
        const monthTransactions = await this.getByMonth(month);
        const income = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        
        trendData.push({
          month,
          income,
          expenses,
          net: income - expenses
        });
      }
      
      return trendData;
    } catch (error) {
      console.error("Error getting income expense trend:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getCategoryBreakdown(month) {
    try {
      const monthTransactions = await this.getByMonth(month);
      const expenseTransactions = monthTransactions.filter(t => t.type === "expense");
      
      const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));
    } catch (error) {
      console.error(`Error getting category breakdown for ${month}:`, error?.response?.data?.message || error);
      return [];
    }
  }
};