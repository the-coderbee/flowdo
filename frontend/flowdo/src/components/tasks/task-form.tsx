'use client';

import React, { useState } from 'react';
import { Task, TaskPriority, Tag, sampleTags, sampleGroups } from '@/sample/tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<Task>) => void;
  mode: 'create' | 'edit';
}

export function TaskForm({ initialTask, open, onOpenChange, onSubmit, mode }: TaskFormProps) {
  const defaultTask = {
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    tags: [],
    estimatedPomodoros: 1,
  };
  
  const [formData, setFormData] = useState<Partial<Task>>(initialTask || defaultTask);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTask?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setFormData({
        ...formData,
        tags: newTags,
      });
    }
  };
  
  const handleRemoveTag = (tagId: string) => {
    const newTags = selectedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(newTags);
    setFormData({
      ...formData,
      tags: newTags,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    onSubmit(formData);
    
    if (mode === 'create') {
      setFormData(defaultTask);
      setSelectedTags([]);
    }
    
    setIsSubmitting(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{mode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-base font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Task title"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-base font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-base font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="text-base font-medium">
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
                onChange={handleChange}
                className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>
            
            {/* Group */}
            <div className="space-y-1.5">
              <label htmlFor="groupId" className="text-base font-medium">
                Group
              </label>
              <select
                id="groupId"
                name="groupId"
                value={formData.groupId || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              >
                <option value="">No Group</option>
                {sampleGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            
            {/* Estimated Pomodoros */}
            <div className="space-y-1.5">
              <label htmlFor="estimatedPomodoros" className="text-base font-medium">
                Pomodoros
              </label>
              <input
                id="estimatedPomodoros"
                name="estimatedPomodoros"
                type="number"
                min="1"
                max="10"
                value={formData.estimatedPomodoros}
                onChange={handleChange}
                className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2.5">
            <label className="text-base font-medium">Tags</label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-1.5 text-sm rounded-full px-3 py-1"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Available Tags */}
            <div className="flex flex-wrap gap-1.5">
              {sampleTags
                .filter(tag => !selectedTags.some(t => t.id === tag.id))
                .map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="flex items-center gap-1.5 text-sm rounded-full px-3 py-1 border border-dashed"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    <Plus size={14} />
                    <span>{tag.name}</span>
                  </button>
                ))}
            </div>
          </div>
          
          <DialogFooter className="mt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-base"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-base">
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 