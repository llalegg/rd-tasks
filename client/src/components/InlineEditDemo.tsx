import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineTextEdit, InlineTextareaEdit, InlineDropdown } from '@/components/ui/inline-edit';
import { useToast } from '@/hooks/use-toast';

export function InlineEditDemo() {
  const [title, setTitle] = useState('Sample Task Title');
  const [description, setDescription] = useState('This is a sample task description that demonstrates the inline editing functionality. You can click anywhere to edit the text.');
  const [status, setStatus] = useState('in_progress');
  const [priority, setPriority] = useState('medium');
  
  const { toast } = useToast();

  const statusOptions = [
    { value: 'new', label: 'New', icon: <div className="w-2 h-2 rounded-full bg-orange-500" /> },
    { value: 'in_progress', label: 'In Progress', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
    { value: 'blocked', label: 'Blocked', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
    { value: 'completed', label: 'Completed', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> },
    { value: 'medium', label: 'Medium Priority', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
    { value: 'high', label: 'High Priority', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
  ];

  const handleSave = (field: string, value: string) => {
    toast({
      title: "Auto-saved",
      description: `${field} updated successfully`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notion-Style Inline Editing Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Editing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#585856]">Task Title</label>
            <InlineTextEdit
              value={title}
              onChange={setTitle}
              onSave={(value) => handleSave('Title', value)}
              placeholder="Click to add a title..."
              className="text-lg font-medium"
              maxLength={100}
              showCharacterCount={true}
            />
          </div>

          {/* Description Editing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#585856]">Description</label>
            <InlineTextareaEdit
              value={description}
              onChange={setDescription}
              onSave={(value) => handleSave('Description', value)}
              placeholder="Click to add a description..."
              className="text-sm font-normal"
              maxLength={500}
              showCharacterCount={true}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#585856]">Status</label>
            <InlineDropdown
              value={status}
              options={statusOptions}
              onChange={setStatus}
              onSave={(value) => handleSave('Status', value)}
              placeholder="Select status..."
            />
          </div>

          {/* Priority Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#585856]">Priority</label>
            <InlineDropdown
              value={priority}
              options={priorityOptions}
              onChange={setPriority}
              onSave={(value) => handleSave('Priority', value)}
              placeholder="Select priority..."
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-[#292928] rounded-lg">
            <h3 className="text-sm font-medium text-[#f7f6f2] mb-2">How to use:</h3>
            <ul className="text-xs text-[#979795] space-y-1">
              <li>• <strong>Click anywhere</strong> on text to start editing</li>
              <li>• <strong>Auto-save</strong> happens on blur, Enter key, or after 2-second pause</li>
              <li>• <strong>Escape key</strong> cancels editing without saving</li>
              <li>• <strong>Character count</strong> shows current/max length</li>
              <li>• <strong>Loading indicator</strong> appears during save</li>
              <li>• <strong>Hover effects</strong> show edit cursor and subtle background</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
