import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { budgetService } from "@/services/api/budgetService";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";
import ApperIcon from "@/components/ApperIcon";
import ProgressBar from "@/components/molecules/ProgressBar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const BudgetCard = ({ budget, categoryInfo, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(budget.monthlyLimit.toString());
  const [editStatus, setEditStatus] = useState(budget.status || 'Planned');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percentage = budget.monthlyLimit > 0 ? (budget.spent / budget.monthlyLimit) * 100 : 0;
  const remaining = budget.monthlyLimit - budget.spent;

  const getStatusColor = () => {
    if (percentage < 50) return "success";
    if (percentage < 80) return "warning";
    return "error";
  };

  const handleSave = async () => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setIsSubmitting(true);
    try {
await budgetService.update(budget.Id, { 
        ...budget,
        monthlyLimit: newAmount,
        status: editStatus
      });
      toast.success("Budget updated successfully!");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update budget. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

const handleCancel = () => {
    setEditAmount(budget.monthlyLimit.toString());
    setEditStatus(budget.status || 'Planned');
    setIsEditing(false);
  };

  return (
    <Card className="p-6 hover">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${categoryInfo.color}20` }}
            >
              <ApperIcon 
                name={categoryInfo.icon} 
                className="w-5 h-5"
                style={{ color: categoryInfo.color }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{budget.category}</h3>
<p className="text-sm text-gray-600">Monthly Budget</p>
            </div>
            
            {/* Status Badge */}
            <div className="mb-3">
              <Badge 
                variant={
                  budget.status === 'Completed' ? 'success' :
                  budget.status === 'Overdue' ? 'error' :
                  budget.status === 'Pending' ? 'warning' : 'default'
                }
              >
                {budget.status || 'Planned'}
              </Badge>
            </div>
            
            {/* Description */}
            {budget.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-2">{budget.description}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="p-2"
          >
            <ApperIcon name="Edit" className="w-4 h-4" />
          </Button>
        </div>

        {/* Budget Amount */}
<div className="space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="flex-1"
                  placeholder="Monthly limit"
                />
              </div>
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full"
              >
                <option value="Planned">Planned</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(budget.monthlyLimit)}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <ProgressBar
            value={budget.spent}
            max={budget.monthlyLimit}
            color="auto"
            showLabel={false}
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Spent: <span className="font-medium text-gray-900">
                {formatCurrency(budget.spent)}
              </span>
            </span>
            <span className={cn(
              "font-medium",
              remaining >= 0 ? "text-success" : "text-error"
            )}>
              {remaining >= 0 ? "Remaining: " : "Over by: "}
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
<div className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium",
          percentage < 50 && "bg-success/10 text-success",
          percentage >= 50 && percentage < 80 && "bg-warning/10 text-warning",
          percentage >= 80 && percentage < 100 && "bg-warning/20 text-warning",
          percentage >= 100 && "bg-error/10 text-error"
        )}>
          <ApperIcon 
            name={
              percentage < 50 ? "CheckCircle" :
              percentage < 80 ? "AlertCircle" : "XCircle"
            } 
            className="w-4 h-4" 
          />
          <span>
            {percentage < 50 && "On track"}
            {percentage >= 50 && percentage < 80 && "Monitor spending"}
            {percentage >= 80 && percentage < 100 && "Approaching limit"}
            {percentage >= 100 && "Over budget"}
          </span>
        </div>
      </motion.div>
    </Card>
  );
};

export default BudgetCard;