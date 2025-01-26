import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskList } from './TaskList';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronDown, ChevronUp, Plus, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  view: 'board' | 'list';
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask?: () => void;
}

const statuses: TaskStatus[] = ['TO-DO', 'IN-PROGRESS', 'COMPLETED'];

const statusColors = {
  'TO-DO': 'bg-pink-50',
  'IN-PROGRESS': 'bg-blue-50',
  'COMPLETED': 'bg-green-50'
};

const statusDisplayNames = {
  'TO-DO': 'Todo',
  'IN-PROGRESS': 'In-Progress',
  'COMPLETED': 'Completed'
};

export function TasksView({ tasks, view, onAddTask, onEditTask, onDeleteTask, onStatusChange }: TasksViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'TO-DO': true,
    'IN-PROGRESS': true,
    'COMPLETED': true
  });
  const [activeMoreMenu, setActiveMoreMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeStatusMenu, setActiveStatusMenu] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force board view on mobile
  const effectiveView = isMobile ? 'board' : view;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onStatusChange(draggableId, destination.droppableId as TaskStatus);
  };

  const toggleSection = (status: TaskStatus) => {
    setExpandedSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleMoreClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMoreMenu(activeMoreMenu === taskId ? null : taskId);
  };

  const handleDeleteClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(taskId);
    setActiveMoreMenu(null);
  };

  const handleConfirmDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(taskId);
    setShowDeleteConfirm(null);
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task);
    setActiveMoreMenu(null);
  };

  const handleStatusClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStatusMenu(activeStatusMenu === taskId ? null : taskId);
  };

  if (effectiveView === 'board') {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
          {statuses.map(status => (
            <TaskList
              key={status}
              tasks={tasks}
              status={status}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </DragDropContext>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-lg">
        <div className="min-w-full">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-600 border-b">
            <div className="col-span-5">Task name</div>
            <div className="col-span-3">Due on</div>
            <div className="col-span-2">Task Status</div>
            <div className="col-span-2">Task Category</div>
          </div>

          <div>
            {statuses.map(status => {
              const filteredTasks = tasks.filter(task => task.status === status);
              const isExpanded = expandedSections[status];

              return (
                <div key={status} className={`${statusColors[status]}`}>
                  <button
                    onClick={() => toggleSection(status)}
                    className="w-full flex items-center justify-between px-6 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                      <span className="font-medium">
                        {statusDisplayNames[status]} ({filteredTasks.length})
                      </span>
                    </div>
                    {status === 'TO-DO' && onAddTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTask();
                        }}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                      >
                        <Plus size={16} />
                        <span className="text-sm font-medium">ADD TASK</span>
                      </button>
                    )}
                  </button>

                  {isExpanded && (
                    <Droppable droppableId={status}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="bg-white"
                        >
                          {filteredTasks.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500">
                              No Tasks in {statusDisplayNames[status]}
                            </div>
                          ) : (
                            filteredTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`relative grid grid-cols-12 gap-4 px-6 py-4 border-t hover:bg-gray-50 ${
                                      snapshot.isDragging ? 'bg-white shadow-lg rounded-lg' : ''
                                    }`}
                                  >
                                    <div className="col-span-5 flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={task.status === 'COMPLETED'}
                                        onChange={() => onStatusChange(
                                          task.id,
                                          task.status === 'COMPLETED' ? 'TO-DO' : 'COMPLETED'
                                        )}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                      />
                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                        <GripVertical size={16} className="text-gray-400" />
                                      </div>
                                      <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    <div className="col-span-3 text-gray-600">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="col-span-2">
                                      <div className="relative">
                                        <button
                                          onClick={(e) => handleStatusClick(task.id, e)}
                                          className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md space-x-1"
                                        >
                                          <span>{task.status}</span>
                                          <ChevronDown size={14} />
                                        </button>
                                        
                                        {activeStatusMenu === task.id && (
                                          <div className="absolute left-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                            {statuses.map((s) => (
                                              <button
                                                key={s}
                                                onClick={() => {
                                                  onStatusChange(task.id, s);
                                                  setActiveStatusMenu(null);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                              >
                                                {statusDisplayNames[s]}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        task.category === 'WORK' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                                      }`}>
                                        {task.category}
                                      </span>
                                      <div className="relative">
                                        <button
                                          onClick={(e) => handleMoreClick(task.id, e)}
                                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                        >
                                          <MoreHorizontal size={16} />
                                        </button>
                                        
                                        {activeMoreMenu === task.id && (
                                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                            <div className="py-1">
                                              <button
                                                onClick={(e) => handleEditClick(task, e)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              >
                                                <Pencil size={14} className="mr-2" />
                                                Edit
                                              </button>
                                              <button
                                                onClick={(e) => handleDeleteClick(task.id, e)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                              >
                                                <Trash2 size={14} className="mr-2" />
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {showDeleteConfirm === task.id && (
                                          <div className="absolute right-0 mt-1 w-72 p-4 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this task?</p>
                                            <div className="flex justify-end space-x-2">
                                              <button
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={(e) => handleConfirmDelete(task.id, e)}
                                                className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}