import { getApperClient } from "@/services/apperClient";

export const savingsGoalService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('SavingsGoal_c', {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "targetAmount_c"}},
          {"field": {"Name": "currentAmount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "note_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{
          "fieldName": "priority_c",
          "sorttype": "ASC"
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
        targetAmount: item.targetAmount_c,
        currentAmount: item.currentAmount_c || 0,
        deadline: item.deadline_c,
priority: item.priority_c,
        tags: item.Tags || "",
        note: item.note_c || "",
        createdAt: item.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('SavingsGoal_c', parseInt(id), {
        fields: [
{"field": {"Name": "Name"}},
          {"field": {"Name": "targetAmount_c"}},
          {"field": {"Name": "currentAmount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "note_c"}},
          {"field": {"Name": "CreatedOn"}}
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
        targetAmount: item.targetAmount_c,
        currentAmount: item.currentAmount_c || 0,
        deadline: item.deadline_c,
priority: item.priority_c,
        tags: item.Tags || "",
        note: item.note_c || "",
        createdAt: item.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching savings goal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(goalData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('SavingsGoal_c', {
        records: [{
          Name: goalData.name,
          targetAmount_c: goalData.targetAmount,
          currentAmount_c: 0,
          deadline_c: goalData.deadline,
priority_c: goalData.priority,
          Tags: goalData.tags || "",
          note_c: goalData.note || ""
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
          targetAmount: item.targetAmount_c,
          currentAmount: item.currentAmount_c || 0,
          deadline: item.deadline_c,
priority: item.priority_c,
          tags: item.Tags || "",
          note: item.note_c || "",
          createdAt: item.CreatedOn
        };
      }
      
      throw new Error("Failed to create savings goal");
    } catch (error) {
      console.error("Error creating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, goalData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.updateRecord('SavingsGoal_c', {
        records: [{
          Id: parseInt(id),
          Name: goalData.name,
          targetAmount_c: goalData.targetAmount,
          currentAmount_c: goalData.currentAmount,
          deadline_c: goalData.deadline,
priority_c: goalData.priority,
          Tags: goalData.tags || "",
          note_c: goalData.note || ""
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
          targetAmount: item.targetAmount_c,
          currentAmount: item.currentAmount_c || 0,
          deadline: item.deadline_c,
priority: item.priority_c,
          tags: item.Tags || "",
          note: item.note_c || "",
          createdAt: item.CreatedOn
        };
      }
      
      throw new Error("Savings goal not found");
    } catch (error) {
      console.error(`Error updating savings goal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async addContribution(id, amount) {
    try {
      // First get current amount
      const currentGoal = await this.getById(id);
      if (!currentGoal) {
        throw new Error("Savings goal not found");
      }
      
      const newAmount = currentGoal.currentAmount + amount;
      
      const apperClient = getApperClient();
      const response = await apperClient.updateRecord('SavingsGoal_c', {
        records: [{
          Id: parseInt(id),
          currentAmount_c: newAmount
        }]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        return {
          ...currentGoal,
          currentAmount: newAmount
        };
      }
      
      throw new Error("Savings goal not found");
    } catch (error) {
      console.error(`Error adding contribution to goal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('SavingsGoal_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        return true;
      }
      
      throw new Error("Savings goal not found");
    } catch (error) {
      console.error(`Error deleting savings goal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async getGoalsSummary() {
    try {
      const goals = await this.getAll();
      const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalRemaining = totalTargetAmount - totalCurrentAmount;
      const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
      
      const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
      const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);

      return {
        totalTargetAmount,
        totalCurrentAmount,
        totalRemaining,
        overallProgress,
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        totalGoalsCount: goals.length
      };
    } catch (error) {
      console.error("Error getting goals summary:", error?.response?.data?.message || error);
      return {
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeGoalsCount: 0,
        completedGoalsCount: 0,
        totalGoalsCount: 0
      };
    }
  }
};