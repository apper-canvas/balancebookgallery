import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import billsService from '@/services/api/billsService';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/dateUtils';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    due_date_c: '',
    amount_c: '',
    status_c: 'unpaid'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billsService.getAll();
      setBills(data || []);
    } catch (err) {
      setError('Failed to load bills');
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bill = null) => {
    if (bill) {
      setEditingBill(bill);
      setFormData({
Name: bill.Name || '',
        Tags: bill.Tags || '',
        due_date_c: bill.due_date_c || '',
        amount_c: bill.amount_c || '',
        status_c: bill.status_c || 'unpaid'
      });
    } else {
      setEditingBill(null);
      setFormData({
        Name: '',
Tags: '',
        due_date_c: '',
        amount_c: '',
        status_c: 'unpaid'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
    setFormData({
      Name: '',
Tags: '',
      due_date_c: '',
      amount_c: '',
      status_c: 'unpaid'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Name.trim() || !formData.due_date_c || !formData.amount_c) {
      toast.error('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    try {
      let result;
      if (editingBill) {
        result = await billsService.update(editingBill.Id, formData);
        if (result) {
          toast.success('Bill updated successfully');
          await loadBills();
        }
      } else {
        result = await billsService.create(formData);
        if (result) {
          toast.success('Bill created successfully');
          await loadBills();
        }
      }
      
      if (result) {
        handleCloseModal();
      }
    } catch (err) {
      toast.error('Failed to save bill');
      console.error('Error saving bill:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (bill) => {
    if (!window.confirm(`Are you sure you want to delete "${bill.Name}"?`)) {
      return;
    }

    try {
      const success = await billsService.delete(bill.Id);
      if (success) {
        toast.success('Bill deleted successfully');
        await loadBills();
      }
    } catch (err) {
      toast.error('Failed to delete bill');
      console.error('Error deleting bill:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unpaid':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'paid') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const getEffectiveStatus = (bill) => {
    if (bill.status_c === 'paid') return 'paid';
    if (isOverdue(bill.due_date_c, bill.status_c)) return 'overdue';
    return 'unpaid';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBills} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600 mt-1">Manage your bills and payments</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <ApperIcon name="Plus" size={16} />
          Add Bill
        </Button>
      </div>

      {bills.length === 0 ? (
        <Empty 
          title="No bills found"
          description="Get started by adding your first bill"
          action={
            <Button onClick={() => handleOpenModal()}>
              <ApperIcon name="Plus" size={16} />
              Add Bill
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
<tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tags</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created On</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Modified On</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Modified By</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bills.map((bill) => {
                      const effectiveStatus = getEffectiveStatus(bill);
                      return (
                        <tr key={bill.Id} className="hover:bg-gray-50">
<td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{bill.Name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {bill.Tags ? bill.Tags.split(',').map(tag => tag.trim()).join(', ') : 'No tags'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(bill.due_date_c)}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {formatCurrency(bill.amount_c)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(effectiveStatus)} capitalize`}>
                              {effectiveStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {bill.CreatedOn ? formatDate(bill.CreatedOn) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {bill.CreatedBy?.Name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {bill.ModifiedOn ? formatDate(bill.ModifiedOn) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {bill.ModifiedBy?.Name || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(bill)}
                              >
                                <ApperIcon name="Edit2" size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(bill)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ApperIcon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {bills.map((bill) => {
              const effectiveStatus = getEffectiveStatus(bill);
              return (
                <Card key={bill.Id} className="p-4">
<div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{bill.Name}</h3>
                      {bill.Tags && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tags: {bill.Tags.split(',').map(tag => tag.trim()).join(', ')}
                        </div>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(effectiveStatus)} capitalize`}>
                      {effectiveStatus}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Calendar" size={14} className="mr-2" />
                      Due: {formatDate(bill.due_date_c)}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <ApperIcon name="DollarSign" size={14} className="mr-2" />
                      {formatCurrency(bill.amount_c)}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(bill)}
                    >
                      <ApperIcon name="Edit2" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bill)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" size={14} />
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBill ? 'Edit Bill' : 'Add Bill'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Bill Name"
            type="text"
            value={formData.Name}
            onChange={(e) => handleInputChange('Name', e.target.value)}
            required
placeholder="Enter bill name"
          />

          <FormField
            label="Tags"
            type="text"
            value={formData.Tags}
            onChange={(e) => handleInputChange('Tags', e.target.value)}
            placeholder="Enter tags (comma-separated)"
          />

          <FormField
            label="Due Date"
            type="date"
            value={formData.due_date_c}
            onChange={(e) => handleInputChange('due_date_c', e.target.value)}
            required
          />

          <FormField
            label="Amount"
            type="number"
            value={formData.amount_c}
            onChange={(e) => handleInputChange('amount_c', e.target.value)}
            required
            step="0.01"
            min="0"
            placeholder="0.00"
          />

          <FormField
            label="Status"
            type="select"
            value={formData.status_c}
            onChange={(e) => handleInputChange('status_c', e.target.value)}
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' }
            ]}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  {editingBill ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingBill ? 'Update Bill' : 'Create Bill'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bills;