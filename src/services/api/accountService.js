import { getApperClient } from '@/services/apperClient';

export const accountService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "institution_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "Owner"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };
      
      const response = await apperClient.fetchRecords('accounts_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching accounts:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "institution_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "Owner"}}
        ]
      };
      
      const response = await apperClient.getRecordById('accounts_c', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(accountData) {
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const cleanData = {};
      if (accountData.Name?.trim()) cleanData.Name = accountData.Name.trim();
      if (accountData.type_c) cleanData.type_c = accountData.type_c;
      if (accountData.balance_c !== undefined && accountData.balance_c !== '') {
        cleanData.balance_c = parseFloat(accountData.balance_c);
      }
      if (accountData.institution_c?.trim()) cleanData.institution_c = accountData.institution_c.trim();

      const params = {
        records: [cleanData]
      };
      
      const response = await apperClient.createRecord('accounts_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} accounts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating account:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, accountData) {
    try {
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const cleanData = { Id: id };
      if (accountData.Name?.trim()) cleanData.Name = accountData.Name.trim();
      if (accountData.type_c) cleanData.type_c = accountData.type_c;
      if (accountData.balance_c !== undefined && accountData.balance_c !== '') {
        cleanData.balance_c = parseFloat(accountData.balance_c);
      }
      if (accountData.institution_c?.trim()) cleanData.institution_c = accountData.institution_c.trim();

      const params = {
        records: [cleanData]
      };
      
      const response = await apperClient.updateRecord('accounts_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} accounts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating account:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [id]
      };
      
      const response = await apperClient.deleteRecord('accounts_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} accounts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting account:', error?.response?.data?.message || error);
      throw error;
    }
  }
};