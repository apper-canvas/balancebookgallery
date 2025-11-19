import { NavLink } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const navigation = [
  { name: "Dashboard", href: "/", icon: "Home" },
  { name: "Transactions", href: "/transactions", icon: "Receipt" },
  { name: "Budgets", href: "/budgets", icon: "CreditCard" },
  { name: "Goals", href: "/goals", icon: "Target" },
{ name: "Accounts", href: "/accounts", icon: "Wallet" },
  { name: "Charts", href: "/charts", icon: "BarChart3" }
];

const LogoutButton = () => {
  const { logout } = useAuth();
  
  return (
    <Button
      variant="ghost"
      onClick={logout}
      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    >
      <ApperIcon name="LogOut" className="w-5 h-5 mr-3" />
      Sign Out
    </Button>
  );
};
const Sidebar = ({ className }) => {
  return (
    <div className={cn("bg-white border-r border-gray-200 w-64 fixed left-0 top-0 bottom-0 z-30", className)}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Wallet" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BalanceBook</h1>
              <p className="text-xs text-gray-500">Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary ml-0 pl-3"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon 
                    name={item.icon} 
                    className={cn(
                      "w-5 h-5 mr-3 transition-colors duration-200",
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                    )} 
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
<div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <ApperIcon name="TrendingUp" className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Stay on track!</p>
                <p className="text-xs text-gray-600">Monitor your financial goals</p>
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;