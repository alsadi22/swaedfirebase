/**
 * Admin User Management Page
 * View, edit, and manage all platform users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserMenu } from '@/components/auth/UserMenu';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole, UserStatus } from '@/types';
import { Search, Edit, Shield, UserX, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import Link from 'next/link';

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']} requireEmailVerification>
      <UserManagementContent />
    </ProtectedRoute>
  );
}

function UserManagementContent() {
  const { user: currentUser } = useAuth();
  const { locale } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map((doc) => doc.data() as User);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });
      
      // Update local state
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      // Update local state
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      VOLUNTEER: 'bg-blue-100 text-blue-800',
      ORG_SUPERVISOR: 'bg-green-100 text-green-800',
      ORG_ADMIN: 'bg-green-100 text-green-800',
      OPERATOR: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      SUPER_ADMIN: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    const colors: Record<UserStatus, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-bold text-gray-900">SwaedUAE Admin</h1>
              </Link>
              <p className="text-sm text-gray-500">{t(locale, 'admin.userManagement')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, 'admin.userManagement')}</CardTitle>
            <CardDescription>
              {locale === 'en'
                ? 'View and manage all platform users'
                : 'عرض وإدارة جميع مستخدمي المنصة'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">{t(locale, 'common.search')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder={locale === 'en' ? 'Search by name or email' : 'البحث بالاسم أو البريد'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleFilter">{locale === 'en' ? 'Filter by Role' : 'تصفية حسب الدور'}</Label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="ALL">{locale === 'en' ? 'All Roles' : 'جميع الأدوار'}</option>
                  <option value="VOLUNTEER">{t(locale, 'roles.volunteer')}</option>
                  <option value="ORG_SUPERVISOR">{t(locale, 'roles.orgSupervisor')}</option>
                  <option value="ORG_ADMIN">{t(locale, 'roles.orgAdmin')}</option>
                  <option value="OPERATOR">{t(locale, 'roles.operator')}</option>
                  <option value="ADMIN">{t(locale, 'roles.admin')}</option>
                  <option value="SUPER_ADMIN">{t(locale, 'roles.superAdmin')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusFilter">{locale === 'en' ? 'Filter by Status' : 'تصفية حسب الحالة'}</Label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="ALL">{locale === 'en' ? 'All Statuses' : 'جميع الحالات'}</option>
                  <option value="ACTIVE">{t(locale, 'admin.active')}</option>
                  <option value="INACTIVE">{t(locale, 'admin.inactive')}</option>
                  <option value="SUSPENDED">{t(locale, 'admin.suspended')}</option>
                  <option value="PENDING_VERIFICATION">{locale === 'en' ? 'Pending Verification' : 'في انتظار التحقق'}</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t(locale, 'common.loading')}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {locale === 'en' ? 'No users found' : 'لم يتم العثور على مستخدمين'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {locale === 'en' ? 'User' : 'المستخدم'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Role' : 'الدور'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Status' : 'الحالة'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Stats' : 'الإحصائيات'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {locale === 'en' ? 'Actions' : 'الإجراءات'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user.role)}`}>
                              {t(locale, `roles.${user.role.toLowerCase().replace('_', '')}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(user.status)}`}>
                              {t(locale, `admin.${user.status.toLowerCase().replace('_', '')}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>{user.totalHours} {locale === 'en' ? 'hrs' : 'ساعة'}</div>
                            <div>{user.totalEvents} {locale === 'en' ? 'events' : 'فعالية'}</div>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{t(locale, 'admin.changeRole')}</CardTitle>
                <CardDescription>
                  {editingUser.displayName} ({editingUser.email})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{locale === 'en' ? 'Select New Role' : 'اختر الدور الجديد'}</Label>
                  {(['VOLUNTEER', 'ORG_SUPERVISOR', 'ORG_ADMIN', 'OPERATOR', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleUpdateRole(editingUser.id, role)}
                      className={`w-full text-left px-4 py-2 rounded border transition-colors ${
                        editingUser.role === role
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white hover:border-primary'
                      }`}
                    >
                      {t(locale, `roles.${role.toLowerCase().replace('_', '')}`)}
                    </button>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={() => setEditingUser(null)}>
                  {t(locale, 'common.cancel')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
