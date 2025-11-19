import React, { useState, useEffect } from 'react';

const TransactionForm = ({ categories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  
  return (
    <div className="transaction-form">
      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-select"
      >
        <option value="">Select a category</option>
        {categories.map(category => (
          <option key={category.Id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TransactionForm;