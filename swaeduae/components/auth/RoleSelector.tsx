/**
 * Role Selector Component
 * Allows users to select their role during registration
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserRole } from '@/types';
import { Users, Building2, Shield } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'volunteer' | 'organization';
  onRoleChange: (role: 'volunteer' | 'organization') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
}) => {
  const roles = [
    {
      id: 'volunteer' as const,
      icon: Users,
      title: 'Volunteer',
      titleAr: 'متطوع',
      description: 'Join events and contribute to your community',
      descriptionAr: 'انضم للفعاليات وساهم في مجتمعك',
    },
    {
      id: 'organization' as const,
      icon: Building2,
      title: 'Organization',
      titleAr: 'منظمة',
      description: 'Create events and manage volunteers',
      descriptionAr: 'أنشئ الفعاليات وأدر المتطوعين',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.id;

        return (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all ${
              isSelected
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onRoleChange(role.id)}
          >
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {role.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};
