import React from 'react';
import { ClipboardList, Search, LogOut, LayoutDashboard, List } from 'lucide-react';
import { User, TaskCategory } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onAddTask: () => void;
  onViewChange: (view: 'board' | 'list') => void;
  onFilterCategory: (category: TaskCategory) => void;
  onFilterDate: (dateRange: [string, string]) => void;
  currentView: 'board' | 'list';
}

export function Header({ 
  user, 
  onLogout, 
  onSearch, 
  onAddTask, 
  onViewChange,
  onFilterCategory,
  onFilterDate,
  currentView 
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-4">
          <span className="font-semibold text-xl">TaskBuddy</span>
          <div className="relative">
            <img
              src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
              alt={user.name}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b">
                  <p className="font-medium text-gray-800">{user.name}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search and Filters - Always Visible */}
        <div className="md:hidden space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              onChange={e => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              onChange={(e) => onFilterCategory(e.target.value as TaskCategory)}
              className="flex-1 appearance-none bg-white px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Category</option>
              <option value="WORK">Work</option>
              <option value="PERSONAL">Personal</option>
            </select>
            <select 
              onChange={(e) => {
                const today = new Date();
                const date = new Date();
                switch(e.target.value) {
                  case 'today':
                    setStartDate(today.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                    break;
                  case 'week':
                    date.setDate(date.getDate() + 7);
                    setStartDate(today.toISOString().split('T')[0]);
                    setEndDate(date.toISOString().split('T')[0]);
                    break;
                  case 'month':
                    date.setMonth(date.getMonth() + 1);
                    setStartDate(today.toISOString().split('T')[0]);
                    setEndDate(date.toISOString().split('T')[0]);
                    break;
                  default:
                    setStartDate('');
                    setEndDate('');
                }
                onFilterDate([startDate, endDate]);
              }}
              className="flex-1 appearance-none bg-white px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Due Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <button
            onClick={onAddTask}
            className="w-full px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            ADD TASK
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ClipboardList className="text-purple-600" size={24} />
            <span className="font-semibold text-xl">TaskBuddy</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <span>Logout</span>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewChange('list')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded ${
                  currentView === 'list' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                }`}
              >
                <List size={18} />
                <span>List</span>
              </button>
              <button
                onClick={() => onViewChange('board')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded ${
                  currentView === 'board' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Board</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  onChange={e => onSearch(e.target.value)}
                  className="pl-10 pr-4 py-1.5 w-64 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={onAddTask}
                className="px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                ADD TASK
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-500">Filter by:</span>
            <div className="relative">
              <select 
                onChange={(e) => onFilterCategory(e.target.value as TaskCategory)}
                className="appearance-none bg-white pl-3 pr-8 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Category</option>
                <option value="WORK">Work</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>

            <div className="relative">
              <select 
                onChange={(e) => {
                  const today = new Date();
                  const date = new Date();
                  switch(e.target.value) {
                    case 'today':
                      setStartDate(today.toISOString().split('T')[0]);
                      setEndDate(today.toISOString().split('T')[0]);
                      break;
                    case 'week':
                      date.setDate(date.getDate() + 7);
                      setStartDate(today.toISOString().split('T')[0]);
                      setEndDate(date.toISOString().split('T')[0]);
                      break;
                    case 'month':
                      date.setMonth(date.getMonth() + 1);
                      setStartDate(today.toISOString().split('T')[0]);
                      setEndDate(date.toISOString().split('T')[0]);
                      break;
                    default:
                      setStartDate('');
                      setEndDate('');
                  }
                  onFilterDate([startDate, endDate]);
                }}
                className="appearance-none bg-white pl-3 pr-8 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Due Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}