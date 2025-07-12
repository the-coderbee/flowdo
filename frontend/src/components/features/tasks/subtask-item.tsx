"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Subtask } from "@/types/task";

interface SubtaskItemProps {
  subtask: Subtask;
  onToggleComplete?: (subtaskId: number) => void;
  onUpdate?: (subtaskId: number, title: string) => void;
  onDelete?: (subtaskId: number) => void;
}

export function SubtaskItem({
  subtask,
  onToggleComplete,
  onUpdate,
  onDelete,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(subtask.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== subtask.title && onUpdate) {
      onUpdate(subtask.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(subtask.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(subtask.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative px-2"
    >
      <motion.div
        className="flex items-center gap-4 py-2 px-3 rounded-md hover:bg-card/50 transition-all duration-200 group"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
      >
        {/* Checkbox */}
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={handleCheckboxClick}
            className={`
              w-4 h-4 rounded border-2 flex items-center justify-center
              transition-all duration-300
              ${
                subtask.is_completed
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "border-border hover:border-primary hover:bg-primary/10"
              }
            `}
          >
            {subtask.is_completed && (
              <motion.svg
                className="w-2.5 h-2.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, ease: "backOut" }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </button>
        </motion.div>

        {/* Subtask title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="h-6 px-2 py-0 text-sm border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                autoFocus
              />
            </motion.div>
          ) : (
            <motion.span
              className={`
                text-sm leading-5 cursor-pointer transition-all duration-200
                ${
                  subtask.is_completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground/80 hover:text-primary"
                }
              `}
              onClick={handleEdit}
              whileHover={{ x: 2 }}
              animate={{
                opacity: subtask.is_completed ? 0.7 : 1,
                scale: subtask.is_completed ? 0.98 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {subtask.title}
            </motion.span>
          )}
        </div>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground"
          initial={{ x: 10 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {onUpdate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent hover:scale-110 transition-all duration-200 cursor-pointer"
              onClick={handleEdit}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-110 transition-all duration-200 cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
