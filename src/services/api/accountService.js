import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';
import accountsData from '../mockData/accounts.json';

// Mock service implementation since Account table is not available in database
class AccountService {
  constructor() {
    this.data = [...accountsData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay();
      return [...this.data].sort((a, b) => b.Id - a.Id);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      await this.delay();
      const account = this.data.find(item => item.Id === parseInt(id));
      return account ? { ...account } : null;
    } catch (error) {
      console.error(`Error fetching account ${id}:`, error);
      throw error;
    }
  }

  async create(accountData) {
    try {
      await this.delay();
      const newAccount = {
        ...accountData,
        Id: this.nextId++,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.push(newAccount);
      toast.success('Account created successfully');
      return { ...newAccount };
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
      throw error;
    }
  }

  async update(id, accountData) {
    try {
      await this.delay();
      const index = this.data.findIndex(item => item.Id === parseInt(id));
      if (index === -1) {
        throw new Error('Account not found');
      }
      
      const updatedAccount = {
        ...this.data[index],
        ...accountData,
        Id: parseInt(id),
        updatedAt: new Date().toISOString()
      };
      
      this.data[index] = updatedAccount;
      toast.success('Account updated successfully');
      return { ...updatedAccount };
    } catch (error) {
      console.error(`Error updating account ${id}:`, error);
      toast.error('Failed to update account');
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.delay();
      const index = this.data.findIndex(item => item.Id === parseInt(id));
      if (index === -1) {
        throw new Error('Account not found');
      }
      
      this.data.splice(index, 1);
      toast.success('Account deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting account ${id}:`, error);
      toast.error('Failed to delete account');
      throw error;
    }
  }

  async getAccountsByType(type) {
    try {
      await this.delay();
      return this.data.filter(account => account.type === type);
    } catch (error) {
      console.error(`Error fetching accounts by type ${type}:`, error);
      throw error;
    }
  }

  async getTotalBalance() {
    try {
      await this.delay();
      return this.data.reduce((total, account) => total + parseFloat(account.balance || 0), 0);
    } catch (error) {
      console.error('Error calculating total balance:', error);
      throw error;
    }
  }
}

export const accountService = new AccountService();