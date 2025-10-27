'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getOrganizationTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
} from '@/lib/services/teamCollaboration';
import type { TeamTask } from '@/types';
import {
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Plus,
  Filter,
  AlertCircle,
} from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<TeamTask['status'] | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TeamTask['priority'],
    dueDate: '',
  });

  useEffect(() => {
    if (user?.organizationId) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user?.organizationId) return;

    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        getOrganizationTasks(user.organizationId),
        getTaskStatistics(user.organizationId),
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!user?.organizationId || !newTask.title) return;

    try {
      await createTask({
        organizationId: user.organizationId,
        title: newTask.title,
        description: newTask.description || undefined,
        assignedTo: [user.id],
        status: 'TODO',
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        createdBy: user.id,
      });

      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TeamTask['status']) => {
    try {
      await updateTask(taskId, { status });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد حذف هذه المهمة؟' : 'Delete this task?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: TeamTask['priority']) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  const getStatusIcon = (status: TeamTask['status']) => {
    if (status === 'COMPLETED') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === 'IN_PROGRESS') {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'المهام' : 'Tasks'}
            </h1>
            <p className="mt-2 text-gray-600">
              {language === 'ar' ? 'إدارة مهام الفريق' : 'Manage team tasks'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{language === 'ar' ? 'المجموع' : 'Total'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{language === 'ar' ? 'للعمل' : 'To Do'}</p>
              <p className="text-2xl font-bold text-gray-600">{stats.todo}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">{language === 'ar' ? 'متأخر' : 'Overdue'}</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="TODO">{language === 'ar' ? 'للعمل' : 'To Do'}</option>
              <option value="IN_PROGRESS">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
              <option value="COMPLETED">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <button
                    onClick={() => {
                      const nextStatus =
                        task.status === 'TODO'
                          ? 'IN_PROGRESS'
                          : task.status === 'IN_PROGRESS'
                          ? 'COMPLETED'
                          : 'TODO';
                      handleUpdateStatus(task.id, nextStatus);
                    }}
                    className="mr-4 mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === 'ar' ? 'لا توجد مهام' : 'No tasks'}
            </h3>
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'العنوان' : 'Title'}
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {language === 'ar' ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
