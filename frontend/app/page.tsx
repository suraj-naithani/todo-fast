'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://todo-alqg5zzyx-surajs-projects.vercel.app';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch tasks' }));
        setError(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        console.error('Error fetching tasks:', response.status, errorData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to server';
      setError(errorMessage);
      console.error('Error fetching tasks:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const taskData: {
        title: string;
        completed: boolean;
        description: string;
      } = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setTitle('');
        setDescription('');
        // Refresh tasks to ensure we have the latest data
        await fetchTasks();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create task' }));
        console.error('Error adding task:', errorData);
        alert(`Failed to create task: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editTitle.trim() || !editDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: editingTask.completed,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
        setEditingTask(null);
        setEditTitle('');
        setEditDescription('');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Task Manager</h1>
          <p className="text-gray-500 text-sm">Stay organized and productive</p>
        </div>

        {/* Add Task Section */}
        <div className="mb-6">
          <div className="border border-gray-200 rounded-lg p-3 bg-white mb-2 shadow-sm">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              required
              className="w-full text-gray-800 placeholder-gray-400 text-sm font-medium outline-none bg-transparent"
            />
            <textarea
              placeholder="Add details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full text-gray-500 placeholder-gray-400 text-base mt-2 outline-none bg-transparent resize-none"
            />
          </div>
          <button
            onClick={handleAddTask}
            disabled={loading || !title.trim() || !description.trim()}
            className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add Task
          </button>
        </div>

        {/* Tasks Section */}
        <div>
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            All Tasks ({tasks.length})
          </h2>

          {fetching && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Loading tasks...
            </div>
          )}

          {error && !fetching && (
            <div className="border border-red-200 rounded-lg p-3 bg-red-50 mb-3">
              <p className="text-red-600 text-sm">
                {error}
              </p>
              <button
                onClick={fetchTasks}
                className="mt-2 text-red-600 text-xs font-medium hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!fetching && !error && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex items-start gap-3 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    className="mt-0.5 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-800 font-semibold text-base break-words">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-500 text-xs mt-0.5 break-words overflow-wrap-anywhere">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3 items-center flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="text-gray-700 text-sm font-medium hover:text-gray-900 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 text-sm font-medium hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && !fetching && !error && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks. Add a task to get started!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50" onClick={() => {
            setEditingTask(null);
            setEditTitle('');
            setEditDescription('');
          }}>
            <div className="bg-white border border-gray-200 rounded-xl p-5 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setEditTitle('');
                    setEditDescription('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Add details"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-300 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleUpdateTask}
                  disabled={loading || !editTitle.trim() || !editDescription.trim()}
                  className="flex-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setEditTitle('');
                    setEditDescription('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
