'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <div className="flex-1 max-w-sm">
      <Label htmlFor="date-input" className="text-sm font-medium mb-2 block">
        Date
      </Label>
      <Input
        id="date-input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="w-full"
      />
      <p className="text-xs text-gray-500 mt-1">
        Select a date to analyze soil data
      </p>
    </div>
  );
}

