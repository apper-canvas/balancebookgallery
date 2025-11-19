import { getApperClient } from "@/services/apperClient";
import React from "react";
import Error from "@/components/ui/Error";

export const categoryService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Category_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}}, 
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "isCustom_c"}}
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
        color: item.color_c,
        icon: item.icon_c,
        isCustom: item.isCustom_c
      }));
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('Category_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "isCustom_c"}}
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
        color: item.color_c,
        icon: item.icon_c,
        isCustom: item.isCustom_c
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByName(name) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('Category_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "isCustom_c"}}
        ],
        where: [{
          "FieldName": "Name",
          "Operator": "EqualTo",
          "Values": [name]
        }]
      });
      
      if (!response.success || !response.data.length) {
        return null;
      }
      
      const item = response.data[0];
      return {
        Id: item.Id,
        name: item.Name,
        color: item.color_c,
        icon: item.icon_c,
        isCustom: item.isCustom_c
      };
    } catch (error) {
      console.error(`Error fetching category by name ${name}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(categoryData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('Category_c', {
        records: [{
          Name: categoryData.name,
          color_c: categoryData.color,
          icon_c: categoryData.icon,
          isCustom_c: true
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
          color: item.color_c,
          icon: item.icon_c,
          isCustom: item.isCustom_c
        };
      }
      
      throw new Error("Failed to create category");
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, categoryData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.updateRecord('Category_c', {
        records: [{
          Id: parseInt(id),
          Name: categoryData.name,
          color_c: categoryData.color,
          icon_c: categoryData.icon,
          isCustom_c: categoryData.isCustom
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
          color: item.color_c,
          icon: item.icon_c,
          isCustom: item.isCustom_c
        };
      }
      
      throw new Error("Category not found");
    } catch (error) {
      console.error(`Error updating category ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('Category_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results && response.results[0]?.success) {
        return true;
      }
      
      throw new Error("Category not found or cannot be deleted");
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
}
};