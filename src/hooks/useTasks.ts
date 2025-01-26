import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch tasks from Firestore
  const getTasks = async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasksData: Task[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));

      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on component mount or when userId changes
  useEffect(() => {
    getTasks();
  }, [userId]);

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      await addDoc(collection(db, 'tasks'), taskData);
      // Refresh tasks after adding a new one
      await getTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { ...taskData, updatedAt: new Date().toISOString() });
      // Refresh tasks after updating
      await getTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      // Refresh tasks after deleting
      await getTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return { tasks, loading, getTasks, addTask, updateTask, deleteTask };
}