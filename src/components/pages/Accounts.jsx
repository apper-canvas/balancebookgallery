import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { accountService } from '@/services/api/accountService';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';
import { motion } from 'framer-motion';

const ACCOUNT_TYPES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Account', label: 'Bank Account' },
  { value: 'Card', label: 'Card' }
];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    type_c: '',
    balance_c: '',
    institution_c: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      setError('Failed to load accounts');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingAccount(null);
    setFormData({
      Name: '',
      type_c: '',
      balance_c: '',
      institution_c: ''
    });
    setShowModal(true);
  }

  function handleEdit(account) {
    setEditingAccount(account);
    setFormData({
      Name: account.Name || '',
      type_c: account.type_c || '',
      balance_c: account.balance_c ? account.balance_c.toString() : '',
      institution_c: account.institution_c || ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.Name.trim()) {
      toast.error('Account name is required');
      return;
    }
    
    if (!formData.type_c) {
      toast.error('Account type is required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingAccount) {
        await accountService.update(editingAccount.Id, formData);
        toast.success('Account updated successfully');
      } else {
        await accountService.create(formData);
        toast.success('Account created successfully');
      }
      
      setShowModal(false);
      loadAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(accountId, accountName) {
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) {
      return;
    }

    try {
      await accountService.delete(accountId);
      toast.success('Account deleted successfully');
      loadAccounts();
    } catch (err) {
      toast.error('Failed to delete account');
    }
  }

  function getAccountIcon(type) {
    switch (type) {
      case 'Cash': return 'Wallet';
      case 'Bank Account': return 'Building2';
      case 'Card': return 'CreditCard';
      default: return 'Wallet';
    }
  }

  function getAccountColor(type) {
    switch (type) {
      case 'Cash': return 'text-green-600 bg-green-50';
      case 'Bank Account': return 'text-blue-600 bg-blue-50';
      case 'Card': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadAccounts} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Empty
          title="No accounts yet"
          description="Create your first account to start tracking your finances"
          actionLabel="Add Account"
          onAction={handleAdd}
          icon="Wallet"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <motion.div
              key={account.Id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getAccountColor(account.type_c)}`}>
                      <ApperIcon name={getAccountIcon(account.type_c)} size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.Name}</h3>
                      <p className="text-sm text-gray-600">{account.type_c}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ApperIcon name="Edit2" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.Id, account.Name)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(account.balance_c || 0)}
                    </span>
                  </div>
                  
                  {account.institution_c && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Institution</span>
                      <span className="text-sm font-medium">{account.institution_c}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created</span>
                    <span>{formatDate(account.CreatedOn)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Account Name"
            type="text"
            value={formData.Name}
            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            required
            placeholder="e.g., Main Checking Account"
          />

          <FormField
            label="Account Type"
            type="select"
            value={formData.type_c}
            onChange={(e) => setFormData({ ...formData, type_c: e.target.value })}
            required
            options={[
              { value: '', label: 'Select account type' },
              ...ACCOUNT_TYPES
            ]}
          />

          <FormField
            label="Initial Balance"
            type="number"
            value={formData.balance_c}
            onChange={(e) => setFormData({ ...formData, balance_c: e.target.value })}
            placeholder="0.00"
            step="0.01"
          />

          {(formData.type_c === 'Bank Account' || formData.type_c === 'Card') && (
            <FormField
              label="Institution"
              type="text"
              value={formData.institution_c}
              onChange={(e) => setFormData({ ...formData, institution_c: e.target.value })}
              placeholder="e.g., Chase Bank, Wells Fargo"
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : editingAccount ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}