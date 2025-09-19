import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'badge';
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className = "", variant = "default" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const selectedDate = value;

  // Format date in US format (MM/DD/YYYY)
  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    
    if (variant === 'badge') {
      const today = new Date();
      const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
      if (diffDays <= 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Get badge styling based on date
  const getBadgeStyles = (date: Date | null) => {
    if (!date || variant !== 'badge') return {};
    
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || diffDays === 0) {
      return {
        backgroundColor: '#321a1a',
        color: '#f87171'
      };
    }
    if (diffDays <= 2) {
      return {
        backgroundColor: '#302608',
        color: '#facc15'
      };
    }
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      color: '#f7f6f2',
      backdropFilter: 'blur(20px)'
    };
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  const clearDate = () => {
    onChange(null);
    setOpen(false);
  };

  const badgeStyles = value ? getBadgeStyles(value) : {
    backgroundColor: 'transparent',
    color: '#979795'
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'badge' ? (
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium h-5 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            style={badgeStyles}
          >
            {formatDate(value)}
          </span>
        ) : (
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal bg-[#171716] border-[#3d3d3c] text-[#f7f6f2] hover:bg-[#292928] ${
              !value && "text-[#979795]"
            } ${className}`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(value)}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#292928] border-[#3d3d3c]" align="start">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="p-1 h-8 w-8 text-[#f7f6f2] hover:bg-[#3a3a38]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium text-[#f7f6f2]">
              {currentMonth.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="p-1 h-8 w-8 text-[#f7f6f2] hover:bg-[#3a3a38]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-[#979795] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => selectDate(day)}
                className={`
                  h-8 w-8 p-0 text-xs font-normal
                  ${!isCurrentMonth(day) ? 'text-[#585856] hover:text-[#979795]' : 'text-[#f7f6f2]'}
                  ${isToday(day) ? 'bg-[#3a3a38] text-[#f7f6f2]' : ''}
                  ${isSelected(day) ? 'bg-[#e5e4e1] text-black hover:bg-[#e5e4e1]' : 'hover:bg-[#3a3a38]'}
                `}
              >
                {day.getDate()}
              </Button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3d3d3c]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectDate(today)}
              className="text-xs text-[#f7f6f2] hover:bg-[#3a3a38]"
            >
              Today
            </Button>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDate}
                className="text-xs text-[#979795] hover:bg-[#3a3a38] hover:text-[#f7f6f2]"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
