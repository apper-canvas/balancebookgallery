import { getApperClient } from "@/services/apperClient";

export const budgetService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Budget_c', {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthlyLimit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to expected format
      return response.data.map(item => ({
        Id: item.Id,
name: item.Name,
        month: item.month_c,
        monthlyLimit: item.monthlyLimit_c,
        spent: item.spent_c || 0,
        rollover: item.rollover_c || 0,
        description: item.description_c || '',
        status: item.status_c || 'Planned',
        category: item.category_c?.Name || ''
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('Budget_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
{"field": {"Name": "month_c"}},
          {"field": {"Name": "monthlyLimit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
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
        month: item.month_c,
        monthlyLimit: item.monthlyLimit_c,
        spent: item.spent_c || 0,
        rollover: item.rollover_c || 0,
        description: item.description_c || '',
        status: item.status_c || 'Planned',
        category: item.category_c?.Name || ''
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Budget_c', {
        fields: [
{"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthlyLimit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "month_c",
          "Operator": "EqualTo",
          "Values": [month]
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(item => ({
        Id: item.Id,
name: item.Name,
        month: item.month_c,
        monthlyLimit: item.monthlyLimit_c,
        spent: item.spent_c || 0,
        rollover: item.rollover_c || 0,
        description: item.description_c || '',
        status: item.status_c || 'Planned',
        category: item.category_c?.Name || ''
      }));
    } catch (error) {
      console.error(`Error fetching budgets for month ${month}:`, error?.response?.data?.message || error);
      return [];
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      
      // First, get the category ID by name
      const categoryResponse = await apperClient.fetchRecords('Category_c', {
        fields: [{"field": {"Name": "Name"}}],
        where: [{
          "FieldName": "Name",
          "Operator": "EqualTo", 
          "Values": [budgetData.category]
        }]
      });
      
      if (!categoryResponse.success || !categoryResponse.data.length) {
        throw new Error("Category not found");
      }
      
      const categoryId = categoryResponse.data[0].Id;
      
      const response = await apperClient.createRecord('Budget_c', {
        records: [{
Name: budgetData.name || `${budgetData.category} Budget`,
          month_c: budgetData.month,
          monthlyLimit_c: budgetData.monthlyLimit,
          spent_c: 0,
          rollover_c: 0,
          description_c: budgetData.description || '',
          status_c: budgetData.status || 'Planned',
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
month: item.month_c,
          monthlyLimit: item.monthlyLimit_c,
          spent: item.spent_c || 0,
          rollover: item.rollover_c || 0,
          description: item.description_c || '',
          status: item.status_c || 'Planned',
          category: budgetData.category
        };
      }
      
      throw new Error("Failed to create budget");
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      
      let categoryId = null;
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('Category_c', {
          fields: [{"field": {"Name": "Name"}}],
          where: [{
            "FieldName": "Name",
            "Operator": "EqualTo",
            "Values": [budgetData.category]
          }]
        });
        
        if (categoryResponse.success && categoryResponse.data.length) {
          categoryId = categoryResponse.data[0].Id;
        }
      }
      
      const updateData = {
        Id: parseInt(id),
Name: budgetData.name,
        month_c: budgetData.month,
        monthlyLimit_c: budgetData.monthlyLimit,
        spent_c: budgetData.spent,
        rollover_c: budgetData.rollover,
        description_c: budgetData.description,
        status_c: budgetData.status
      };
      
      if (categoryId) {
        updateData.category_c = categoryId;
      }
      
      const response = await apperClient.updateRecord('Budget_c', {
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
          month: item.month_c,
          monthlyLimit: item.monthlyLimit_c,
          spent: item.spent_c || 0,
          rollover: item.rollover_c || 0,
          description: item.description_c || '',
          status: item.status_c || 'Planned',
          category: budgetData.category
        };
      }
      
      throw new Error("Budget not found");
    } catch (error) {
      console.error(`Error updating budget ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateSpent(category, month, amount) {
    try {
      const apperClient = getApperClient();
      
      // Find the budget by category and month
      const budgetResponse = await apperClient.fetchRecords('Budget_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"name": "category_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        whereGroups: [{
          "operator": "AND",
          "subGroups": [{
            "conditions": [
              {
                "fieldName": "month_c",
                "operator": "EqualTo",
                "values": [month]
              },
              {
                "fieldName": "category_c",
                "operator": "EqualTo", 
                "values": [category]
              }
            ]
          }]
        }]
      });
      
      if (!budgetResponse.success || !budgetResponse.data.length) {
        return null;
      }
      
      const budget = budgetResponse.data[0];
      const response = await apperClient.updateRecord('Budget_c', {
        records: [{
          Id: budget.Id,
          spent_c: amount
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results[0]?.success) {
        return { Id: budget.Id, spent: amount };
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating spent amount:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('Budget_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        return true;
      }
      
      throw new Error("Budget not found");
    } catch (error) {
      console.error(`Error deleting budget ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async getBudgetSummary(month) {
    try {
      const budgets = await this.getByMonth(month);
      const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
      const remaining = totalBudget - totalSpent;
      const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      return {
        totalBudget,
        totalSpent,
        remaining,
        percentage,
        categories: budgets.length
      };
    } catch (error) {
      console.error(`Error getting budget summary for ${month}:`, error?.response?.data?.message || error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
        categories: 0
      };
    }
  }
};