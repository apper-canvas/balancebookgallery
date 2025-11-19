import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { accountService } from '@/services/api/accountService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import MetricCard from '@/components/molecules/MetricCard';
import Modal from '@/components/molecules/Modal';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', icon: 'CreditCard' },
  { value: 'savings', label: 'Savings', icon: 'PiggyBank' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp' },
  { value: 'credit', label: 'Credit', icon: 'CreditCard' }
];

const BANKS = [
  'Chase Bank', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One',
  'Ally Bank', 'Marcus by Goldman Sachs', 'American Express', 'Discover',
  'Fidelity', 'Vanguard', 'Charles Schwab', 'Other'
];

function AccountForm({ account, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    accountNumber: '',
    bank: '',
    interestRate: '',
    minimumBalance: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        type: account.type || 'checking',
        balance: account.balance?.toString() || '',
        accountNumber: account.accountNumber || '',
        bank: account.bank || '',
        interestRate: account.interestRate?.toString() || '',
        minimumBalance: account.minimumBalance?.toString() || '',
        isActive: account.isActive !== false
      });
    } else {
      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        accountNumber: '',
        bank: '',
        interestRate: '',
        minimumBalance: '',
        isActive: true
      });
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        minimumBalance: parseFloat(formData.minimumBalance) || 0
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add New Account'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Primary Checking"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <Select
              value={formData.type}
              onChange={(value) => handleChange('type', value)}
              options={ACCOUNT_TYPES.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank
            </label>
            <Select
              value={formData.bank}
              onChange={(value) => handleChange('bank', value)}
              options={BANKS.map(bank => ({ value: bank, label: bank }))}
              placeholder="Select bank"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => handleChange('balance', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <Input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              placeholder="****1234"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.interestRate}
              onChange={(e) => handleChange('interestRate', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Balance
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.minimumBalance}
              onChange={(e) => handleChange('minimumBalance', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Account is active
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AccountCard({ account, onEdit, onDelete }) {
  const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.type) || ACCOUNT_TYPES[0];
  const balanceColor = account.balance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceIcon = account.balance >= 0 ? 'TrendingUp' : 'TrendingDown';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "p-6 hover:shadow-lg transition-all duration-200",
        !account.isActive && "opacity-60 bg-gray-50"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              account.type === 'checking' && "bg-blue-100 text-blue-600",
              account.type === 'savings' && "bg-green-100 text-green-600",
              account.type === 'investment' && "bg-purple-100 text-purple-600",
              account.type === 'credit' && "bg-orange-100 text-orange-600"
            )}>
              <ApperIcon name={typeInfo.icon} size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{account.name}</h3>
                {!account.isActive && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-1">{typeInfo.label}</p>
              
              {account.bank && (
                <p className="text-sm text-gray-400">{account.bank}</p>
              )}
              
              {account.accountNumber && (
                <p className="text-sm text-gray-400 font-mono">{account.accountNumber}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(account)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ApperIcon name="Edit2" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(account.Id)}
              className="text-gray-400 hover:text-red-600"
            >
              <ApperIcon name="Trash2" size={16} />
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name={balanceIcon} size={16} className={balanceColor} />
              <span className={cn("text-lg font-semibold", balanceColor)}>
                {formatCurrency(Math.abs(account.balance))}
                {account.balance < 0 && " owed"}
              </span>
            </div>
            
            {account.interestRate > 0 && (
              <div className="text-sm text-gray-500">
                {account.interestRate}% APY
              </div>
            )}
          </div>

          {account.minimumBalance > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Min. balance: {formatCurrency(account.minimumBalance)}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    totalDebt: 0
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountService.getAll();
      setAccounts(data);
      calculateStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (accountData) => {
    const totalBalance = accountData
      .filter(acc => acc.balance >= 0)
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalDebt = Math.abs(accountData
      .filter(acc => acc.balance < 0)
      .reduce((sum, acc) => sum + acc.balance, 0));

    setStats({
      totalBalance,
      totalAccounts: accountData.length,
      activeAccounts: accountData.filter(acc => acc.isActive).length,
      totalDebt
    });
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingAccount) {
        await accountService.update(editingAccount.Id, formData);
      } else {
        await accountService.create(formData);
      }
      await loadAccounts();
      setShowForm(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (accountId) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await accountService.delete(accountId);
        await loadAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.bank?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <Loading className="min-h-screen" />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadAccounts}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600">Manage your financial accounts</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Account
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Balance"
          value={stats.totalBalance}
          icon="Wallet"
          color="success"
          format="currency"
        />
        <MetricCard
          title="Total Debt"
          value={stats.totalDebt}
          icon="CreditCard"
          color="error"
          format="currency"
        />
        <MetricCard
          title="Active Accounts"
          value={stats.activeAccounts}
          icon="CheckCircle"
          color="info"
        />
        <MetricCard
          title="Total Accounts"
          value={stats.totalAccounts}
          icon="Building2"
          color="primary"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: 'all', label: 'All Types' },
                ...ACCOUNT_TYPES.map(type => ({
                  value: type.value,
                  label: type.label
                }))
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Account List */}
      {filteredAccounts.length === 0 ? (
        <Empty
          title="No accounts found"
          description={searchTerm || selectedType !== 'all' 
            ? "No accounts match your current filters."
            : "You haven't added any accounts yet."
          }
          actionLabel={searchTerm || selectedType !== 'all' ? "Clear Filters" : "Add Your First Account"}
          onAction={() => {
            if (searchTerm || selectedType !== 'all') {
              setSearchTerm('');
              setSelectedType('all');
            } else {
              setShowForm(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAccounts.map(account => (
              <AccountCard
                key={account.Id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Account Form Modal */}
      <AccountForm
        account={editingAccount}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAccount(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}