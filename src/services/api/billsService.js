import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class BillsService {
  constructor() {
    this.tableName = 'bills_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "status_c"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching bills:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "status_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching bill ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(billData) {
    try {
      // Only include updateable fields
      const createData = {};
      if (billData.Name) createData.Name = billData.Name;
      if (billData.due_date_c) createData.due_date_c = billData.due_date_c;
      if (billData.amount_c) createData.amount_c = parseFloat(billData.amount_c);
      if (billData.status_c) createData.status_c = billData.status_c;

      const apperClient = getApperClient();
      const response = await apperClient.createRecord(this.tableName, {
        records: [createData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} bills:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating bill:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, billData) {
    try {
      // Only include updateable fields
      const updateData = { Id: parseInt(id) };
      if (billData.Name) updateData.Name = billData.Name;
      if (billData.due_date_c) updateData.due_date_c = billData.due_date_c;
      if (billData.amount_c) updateData.amount_c = parseFloat(billData.amount_c);
      if (billData.status_c) updateData.status_c = billData.status_c;

      const apperClient = getApperClient();
      const response = await apperClient.updateRecord(this.tableName, {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} bills:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating bill:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} bills:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting bill:", error?.response?.data?.message || error);
      return false;
    }
  }
}

export default new BillsService();
import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class BillsService {
  constructor() {
    this.tableName = 'bills_c';
    this.apperClient = null;
  }

  async getApperClient() {
    if (!this.apperClient) {
      this.apperClient = getApperClient();
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const apperClient = await this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "status_c"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching bills:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = await this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "status_c"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching bill ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(billData) {
    try {
      const apperClient = await this.getApperClient();
      const params = {
        records: [{
          Name: billData.Name,
          due_date_c: billData.due_date_c,
          amount_c: parseFloat(billData.amount_c),
          status_c: billData.status_c
        }]
      };

      const response = await apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create bill: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return successful[0]?.data || null;
      }
      return null;
    } catch (error) {
      console.error("Error creating bill:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, billData) {
    try {
      const apperClient = await this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: billData.Name,
          due_date_c: billData.due_date_c,
          amount_c: parseFloat(billData.amount_c),
          status_c: billData.status_c
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update bill: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        return successful[0]?.data || null;
      }
      return null;
    } catch (error) {
      console.error("Error updating bill:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = await this.getApperClient();
      const params = { RecordIds: [parseInt(id)] };

      const response = await apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete bill: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting bill:", error?.response?.data?.message || error);
      return false;
    }
  }
}
