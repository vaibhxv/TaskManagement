import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { Bold, Italic, List, AlignLeft, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const { user } = useAuth();
  const storage = getStorage();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'WORK',
    status: 'TO-DO',
    dueDate: new Date().toISOString().split('T')[0],
    tags: [],
    attachments: [],
    userId: user?.id || '',
    ...task
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
        dueDate: task.dueDate,
        tags: task.tags || [],
        attachments: task.attachments || [],
        userId: task.userId
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        category: 'WORK',
        status: 'TO-DO',
        dueDate: new Date().toISOString().split('T')[0],
        tags: [],
        attachments: [],
        userId: user?.id || ''
      });
    }
  }, [task, user]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags?.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileId = uuidv4();
        const storageRef = ref(storage, `users/${user.id}/attachments/${fileId}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...urls]
      }));
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          {/* Description Editor */}
          <div className="border rounded-lg">
            <textarea
              placeholder="Add description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-sm sm:text-base min-h-[100px] resize-none rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <div className="border-t p-2 flex space-x-2 bg-gray-50">
              {[Bold, Italic, List, AlignLeft].map((Icon, index) => (
                <button 
                  key={index}
                  type="button" 
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Category, Date, Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <div className="flex gap-1.5">
                {(['WORK', 'PERSONAL'] as TaskCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormData({ ...formData, category })}
                    className={`flex-1 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${
                      formData.category === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="TO-DO">To Do</option>
                <option value="IN-PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {formData.tags?.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs sm:text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Attachments</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-3">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-center space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-2 text-sm text-blue-600 hover:text-blue-700 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Tap to add files'}
                </button>
                <p className="text-xs text-gray-500">
                  {uploading ? 'Please wait...' : 'PDF, images, documents'}
                </p>
              </div>
              <div className="mt-3 space-y-1.5">
                {formData.attachments?.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-xs sm:text-sm"
                  >
                    <span className="truncate pr-2">
                      {decodeURIComponent(url.split('/').pop()?.split('?')[0] || '')}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg order-1 sm:order-2"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}