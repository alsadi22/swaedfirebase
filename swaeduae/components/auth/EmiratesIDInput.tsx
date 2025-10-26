/**
 * Emirates ID Input Component
 * Specialized input for UAE Emirates ID with format validation
 */

'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmiratesIDInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const EmiratesIDInput: React.FC<EmiratesIDInputProps> = ({
  value,
  onChange,
  error,
  required = false,
}) => {
  const [formatted, setFormatted] = useState(value);

  const formatEmiratesId = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as 784-YYYY-NNNNNNN-N
    let formatted = digits;
    if (digits.length > 3) {
      formatted = `784-${digits.slice(3)}`;
    }
    if (digits.length > 7) {
      formatted = `784-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length > 14) {
      formatted = `784-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`;
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatEmiratesId(input);
    setFormatted(formatted);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="emiratesId">
        Emirates ID {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id="emiratesId"
        type="text"
        value={formatted}
        onChange={handleChange}
        placeholder="784-YYYY-NNNNNNN-N"
        maxLength={18}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Format: 784-YYYY-NNNNNNN-N (e.g., 784-2000-1234567-1)
      </p>
    </div>
  );
};
