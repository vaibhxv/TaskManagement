import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { MoreVertical, Pencil, Trash2, Tag, ChevronDown } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface TaskListProps {
  tasks: Task[];
  status: TaskStatus;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskList({ tasks, status, onEditTask, onDeleteTask, onStatusChange }: TaskListProps) {
  const [activeStatusMenu, setActiveStatusMenu] = useState<string | null>(null);
  const filteredTasks = tasks.filter(task => task.status === status);
  const statusColor = {
    'TO-DO': 'bg-pink-100',
    'IN-PROGRESS': 'bg-blue-100',
    'COMPLETED': 'bg-green-100'
  }[status];

  const handleStatusClick = (taskId: string) => {
    setActiveStatusMenu(activeStatusMenu === taskId ? null : taskId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className={`p-4 ${statusColor} rounded-t-lg flex justify-between items-center`}>
        <h2 className="font-semibold">{status} ({filteredTasks.length})</h2>
        <button className="p-1 hover:bg-white/10 rounded">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <Droppable droppableId={status}>
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-4 min-h-[200px]"
          >
            {filteredTasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No Tasks in {status}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex flex-col p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.status === 'COMPLETED'}
                              onChange={() => onStatusChange(task.id, task.status === 'COMPLETED' ? 'TO-DO' : 'COMPLETED')}
                              className="w-5 h-5 rounded border-gray-300"
                            />
                            <div>
                              <h3 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-500">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <button
                                onClick={() => handleStatusClick(task.id)}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1"
                              >
                                <span>{task.status}</span>
                                <ChevronDown size={14} />
                              </button>
                              
                              {activeStatusMenu === task.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  {(['TO-DO', 'IN-PROGRESS', 'COMPLETED'] as TaskStatus[]).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => {
                                        onStatusChange(task.id, s);
                                        setActiveStatusMenu(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 hover:bg-gray-200 rounded text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Tag size={14} className="text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}