import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
  autoSaveDelay?: number;
  disabled?: boolean;
  showCharacterCount?: boolean;
}

export function InlineEdit({
  value,
  onChange,
  onSave,
  placeholder = "Click to edit...",
  className,
  multiline = false,
  maxLength,
  autoSaveDelay = 2000,
  disabled = false,
  showCharacterCount = false,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync external value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Auto-save with debouncing
  const debouncedSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      if (editValue !== value && onSave) {
        setIsSaving(true);
        onSave(editValue);
        setTimeout(() => setIsSaving(false), 500); // Show loading state briefly
      }
    }, autoSaveDelay);

    setSaveTimeout(timeout);
  }, [editValue, value, onSave, autoSaveDelay]);

  // Handle input changes
  const handleInputChange = (newValue: string) => {
    setEditValue(newValue);
    onChange(newValue);
    debouncedSave();
    
    // Auto-resize textarea
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Handle focus (enter edit mode)
  const handleFocus = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  // Handle blur (exit edit mode and save)
  const handleBlur = () => {
    setIsEditing(false);
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    if (editValue !== value && onSave) {
      setIsSaving(true);
      onSave(editValue);
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(value);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
        // Auto-resize textarea when entering edit mode
        const textarea = inputRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [isEditing, multiline]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const displayValue = value || placeholder;
  const isEmpty = !value;

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={cn(
            "w-full bg-transparent border-none outline-none",
            "text-[#f7f6f2] placeholder:text-[#979795]",
            "focus:ring-0 focus:outline-none",
            multiline ? "min-h-[40px] resize-none overflow-hidden" : "h-auto",
            className
          )}
          placeholder={placeholder}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '8px 12px',
            transition: 'all 0.2s ease',
          }}
        />
        {isSaving && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 border border-[#979795] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {showCharacterCount && maxLength && (
          <div className="absolute bottom-1 right-2 text-xs text-[#979795]">
            {editValue.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group cursor-pointer p-2 rounded transition-all duration-200",
        "hover:bg-[rgba(255,255,255,0.05)]",
        isEmpty && "text-[#979795]",
        className
      )}
      onClick={handleFocus}
      style={{ minHeight: multiline ? '60px' : 'auto' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEmpty ? (
            <span className="text-[#979795]">{placeholder}</span>
          ) : (
            <span className="text-[#f7f6f2] whitespace-pre-wrap">{displayValue}</span>
          )}
        </div>
      </div>
      {isSaving && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 border border-[#979795] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Specialized components for different field types
export function InlineTextEdit(props: Omit<InlineEditProps, 'multiline'>) {
  return <InlineEdit {...props} multiline={false} />;
}

export function InlineTextareaEdit(props: Omit<InlineEditProps, 'multiline'>) {
  return <InlineEdit {...props} multiline={true} />;
}

// Inline dropdown component
interface InlineDropdownProps {
  value: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function InlineDropdown({
  value,
  options,
  onChange,
  onSave,
  placeholder = "Select option...",
  className,
  disabled = false,
}: InlineDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    if (onSave) {
      onSave(optionValue);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className={cn(
          "group cursor-pointer p-2 rounded transition-all duration-200",
          "hover:bg-[rgba(255,255,255,0.05)]",
          !selectedOption && "text-[#979795]",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className="text-[#f7f6f2]">
              {selectedOption?.label || placeholder}
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-[#292928] border border-[#3d3d3c] rounded-lg shadow-lg z-50"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2 border-b border-[#3d3d3c]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search options..."
              className="w-full bg-transparent border-none outline-none text-[#f7f6f2] placeholder:text-[#979795]"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2 p-2 hover:bg-[#3a3a38] cursor-pointer transition-colors"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.icon}
                <span className="text-[#f7f6f2]">{option.label}</span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-[#979795] text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
