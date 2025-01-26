import { useState } from 'react';
import { Task, TaskStatus, TaskCategory } from './types';
import { Header } from './components/Header';
import { TasksView } from './components/TaskView';
import { TaskModal } from './components/TaskModal';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { ClipboardList } from 'lucide-react';
import dashboardimg from './assets/dashboard.png'

function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask } = useTasks(user?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory>('ALL');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [currentView, setCurrentView] = useState<'board' | 'list'>('list');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen circle-bg flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between relative">
          {/* Text Content */}
          <div className="max-w-md flex flex-col text-center space-y-8 px-4 md:px-0">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <ClipboardList className="text-purple-600" size={48} />
                <h1 className="text-5xl font-bold text-purple-600">TaskBuddy</h1>
              </div>
              <p className="text-gray-600 text-xl px-8">
                Streamline your workflow and track progress effortlessly with our all-in-one task management app.
              </p>
            </div>
    
            {/* Google Sign-in Button */}
            <button 
              className="flex z-50 items-center justify-center space-x-3 w-full max-w-md mx-auto bg-white text-gray-800 px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200"
              onClick={signIn}
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google logo" 
                className="w-6 h-6"
              />
              <span className="text-lg font-medium">Continue with Google</span>
            </button>
          </div>
    
          {/* Half-visible Image */}
          <div className="hidden md:block absolute right-[-10%] top-1/2 transform -translate-y-1/2 overflow-hidden">
            <img 
              src={dashboardimg} 
              alt="Task Management Preview" 
              className="rounded-l-2xl shadow-2xl h-full w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  const handleAddTask = async (taskData: Partial<Task>) => {
    const newTask = {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
    } as Omit<Task, 'id'>;

    await addTask(newTask);
    setIsModalOpen(false);
  };

  const handleEditTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, taskData);
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || task.category === categoryFilter;
    const matchesDate = !dateRange[0] || (
      task.dueDate >= dateRange[0] && 
      task.dueDate <= (dateRange[1] || dateRange[0])
    );
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={signOut}
        onSearch={setSearchQuery}
        onAddTask={() => {
          setEditingTask(undefined);
          setIsModalOpen(true);
        }}
        onViewChange={setCurrentView}
        currentView={currentView}
        onFilterCategory={setCategoryFilter}
        onFilterDate={setDateRange}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {tasksLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <TasksView
            tasks={filteredTasks}
            view={currentView}
            onEditTask={task => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
      />
    </div>
  );
}

export default App;