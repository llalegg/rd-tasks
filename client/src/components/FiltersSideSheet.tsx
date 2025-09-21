import React, { useState } from 'react';
import { Task } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { X, ChevronDown, CalendarDays, RotateCcw, Search } from 'lucide-react';

interface FiltersSideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Filter states
  assigneeFilter: string[];
  priorityFilter: string[];
  statusFilter: string[];
  typeFilters: string[];
  creatorFilters: string[];
  athleteFilters: string[];
  hideCompleted: boolean;
  
  // Filter handlers
  onAssigneeFilterChange: (value: string[]) => void;
  onPriorityFilterChange: (value: string[]) => void;
  onStatusFilterChange: (value: string[]) => void;
  onTypeFilterChange: (value: string[]) => void;
  onCreatorFilterChange: (value: string[]) => void;
  onAthleteFilterChange: (value: string[]) => void;
  onHideCompletedChange: (checked: boolean) => void;
  
  // Available options
  availableAssignees: any[];
  availableCreators: any[];
  availableAthletes: any[];
}

export default function FiltersSideSheet({
  isOpen,
  onClose,
  assigneeFilter,
  priorityFilter,
  statusFilter,
  typeFilters,
  creatorFilters,
  athleteFilters,
  hideCompleted,
  onAssigneeFilterChange,
  onPriorityFilterChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onCreatorFilterChange,
  onAthleteFilterChange,
  onHideCompletedChange,
  availableAssignees,
  availableCreators,
  availableAthletes,
}: FiltersSideSheetProps) {
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<{[key: string]: string}>({});

  // Clear all filters
  const clearAllFilters = () => {
    onAssigneeFilterChange([]);
    onPriorityFilterChange([]);
    onStatusFilterChange([]);
    onTypeFilterChange([]);
    onCreatorFilterChange([]);
    onAthleteFilterChange([]);
    onHideCompletedChange(false);
  };

  // Filter option handlers
  const handleFilterToggle = (
    currentValues: string[], 
    value: string, 
    onChange: (value: string[]) => void
  ) => {
    if (currentValues.includes(value)) {
      onChange(currentValues.filter(v => v !== value));
    } else {
      onChange([...currentValues, value]);
    }
  };

  // Multi-select dropdown component matching Figma design
  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selectedValues, 
    onChange,
    placeholder = "Select one or multiple options"
  }: {
    label: string;
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
  }) => {
    const isOpen = openDropdown === label.toLowerCase().replace(/\s+/g, '-');
    
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || placeholder;
      }
      return `${selectedValues.length} selected`;
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="font-['Montserrat:Medium',_sans-serif] text-[12px] leading-[1.32] text-[#979795]">
          {label}
        </div>
        <div className="relative">
          <Popover 
            open={isOpen} 
            onOpenChange={(open) => setOpenDropdown(open ? label.toLowerCase().replace(/\s+/g, '-') : null)}
          >
            <PopoverTrigger asChild>
              <button className="bg-transparent border border-[#3d3d3c] rounded-[8px] h-[44px] px-[16px] py-[12px] flex items-center justify-between w-full hover:border-[#4a4a48] transition-colors">
                <span className="font-['Montserrat:Regular',_sans-serif] text-[14px] leading-[1.46] text-[#585856] flex-1 text-left">
                  {getDisplayText()}
                </span>
                <ChevronDown className="w-5 h-5 text-[#f7f6f2] shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[var(--radix-popover-trigger-width)] bg-[#292928] border-[#3d3d3c] rounded-[8px] p-0"
              align="start"
            >
              <div className="py-1">
                <button
                  onClick={() => {
                    onChange([]);
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors border-b border-[#3D3D3C] mb-1"
                >
                  Clear All
                </button>
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleFilterToggle(selectedValues, option.value, onChange)}
                    className="flex items-center px-3 py-2 text-xs text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => handleFilterToggle(selectedValues, option.value, onChange)}
                      className="mr-2 h-3 w-3 data-[state=checked]:bg-[#e5e4e1] data-[state=checked]:border-[#e5e4e1]"
                    />
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  // Date input component matching Figma design
  const DateInput = ({ 
    label, 
    placeholder = "Select date" 
  }: {
    label: string;
    placeholder?: string;
  }) => (
    <div className="flex flex-col gap-2 w-full">
      <div className="font-['Montserrat:Medium',_sans-serif] text-[12px] leading-[1.32] text-[#979795]">
        {label}
      </div>
      <button className="bg-transparent border border-[#3d3d3c] rounded-[8px] h-[44px] px-[16px] py-[12px] flex items-center gap-[10px] w-full hover:border-[#4a4a48] transition-colors">
        <CalendarDays className="w-5 h-5 text-[#f7f6f2] shrink-0" />
        <span className="font-['Montserrat:Regular',_sans-serif] text-[14px] leading-[1.46] text-[#585856] flex-1 text-left">
          {placeholder}
        </span>
      </button>
    </div>
  );

  // Athlete selection dropdown matching Figma design
  const AthleteSelectionDropdown = ({ 
    label, 
    options, 
    selectedValues, 
    onChange,
    placeholder = "Select one or multiple options"
  }: {
    label: string;
    options: { value: string; label: string; avatar?: string }[];
    selectedValues: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
  }) => {
    const dropdownKey = label.toLowerCase().replace(/\s+/g, '-');
    const isOpen = openDropdown === dropdownKey;
    const searchQuery = searchQueries[dropdownKey] || '';
    
    const filteredOptions = options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || placeholder;
      }
      return `${selectedValues.length} selected`;
    };

    const handleSearchChange = (value: string) => {
      setSearchQueries(prev => ({ ...prev, [dropdownKey]: value }));
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="font-['Montserrat:Medium',_sans-serif] text-[12px] leading-[1.32] text-[#979795]">
          {label}
        </div>
        <div className="relative">
          <Popover 
            open={isOpen} 
            onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
          >
            <PopoverTrigger asChild>
              <button className="bg-transparent border border-[#3d3d3c] rounded-[8px] h-[44px] px-[16px] py-[12px] flex items-center justify-between w-full hover:border-[#4a4a48] transition-colors">
                <span className="font-['Montserrat:Regular',_sans-serif] text-[14px] leading-[1.46] text-[#585856] flex-1 text-left">
                  {getDisplayText()}
                </span>
                <ChevronDown className="w-5 h-5 text-[#f7f6f2] shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[var(--radix-popover-trigger-width)] bg-[#292928] border-[#3d3d3c] rounded-[12px] p-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
              align="start"
            >
              <div className="flex flex-col">
                {/* Search Field */}
                <div className="p-[4px]">
                  <div className="bg-transparent border border-[#292928] rounded-[8px] h-[32px] px-[12px] py-[8px] flex items-center gap-[10px]">
                    <Search className="w-4 h-4 text-[#f7f6f2] shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-transparent border-none outline-none font-['Montserrat:Regular',_sans-serif] text-[14px] leading-[1.46] text-[#979795] flex-1 placeholder-[#979795]"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="px-0 py-[4px]">
                  <div className="bg-[#3d3d3c] h-px w-full" />
                </div>

                {/* Clear All Button */}
                <div className="px-[12px] py-[4px]">
                  <button
                    onClick={() => {
                      onChange([]);
                      setOpenDropdown(null);
                    }}
                    className="w-full text-left px-0 py-[8px] text-xs text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors rounded-[4px]"
                  >
                    Clear All
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col gap-[2px] pb-[4px]">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleFilterToggle(selectedValues, option.value, onChange)}
                      className="flex gap-[8px] h-[36px] items-center px-[12px] py-[8px] hover:bg-[#3a3a38] transition-colors cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="bg-center bg-cover bg-no-repeat rounded-[9999px] shrink-0 size-[32px] border border-black/70"
                           style={{ 
                             backgroundImage: option.avatar 
                               ? `url('${option.avatar}')` 
                               : `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face')` 
                           }}>
                      </div>
                      
                      {/* Name */}
                      <div className="font-['Montserrat:Regular',_sans-serif] text-[14px] leading-[1.46] text-[#f7f6f2] flex-1 overflow-hidden">
                        <span className="overflow-ellipsis whitespace-nowrap block">
                          {option.label}
                        </span>
                      </div>

                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={() => handleFilterToggle(selectedValues, option.value, onChange)}
                        className="h-3 w-3 data-[state=checked]:bg-[#e5e4e1] data-[state=checked]:border-[#e5e4e1] shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[384px] bg-[#171716] border-l border-[#292928] p-0 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-2px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="border-b border-[#292928] p-[20px] relative">
          <div className="font-['Montserrat:SemiBold',_sans-serif] text-[16px] leading-[1.5] text-[#f7f6f2]">
            Filters
          </div>
          <button
            onClick={onClose}
            className="absolute right-[16px] top-[16px] size-[16px] opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-[#f7f6f2]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[20px] py-[20px] space-y-[20px]">
          {/* Status */}
          <MultiSelectDropdown
            label="Status"
            options={[
              { value: 'new', label: 'New' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'completed', label: 'Completed' }
            ]}
            selectedValues={statusFilter}
            onChange={onStatusFilterChange}
          />

          {/* Type */}
          <MultiSelectDropdown
            label="Type"
            options={[
              { value: 'injury', label: 'Injury' },
              { value: 'training', label: 'Training' },
              { value: 'analysis', label: 'Analysis' },
              { value: 'assessment', label: 'Assessment' },
              { value: 'mechanicalanalysis', label: 'Mechanical Analysis' }
            ]}
            selectedValues={typeFilters}
            onChange={onTypeFilterChange}
          />

          {/* Priority */}
          <MultiSelectDropdown
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
            selectedValues={priorityFilter}
            onChange={onPriorityFilterChange}
          />

          {/* Assignee */}
          {availableAssignees.length > 0 && (
            <AthleteSelectionDropdown
              label="Assignee"
              options={availableAssignees.map((user: any) => ({ 
                value: user.id, 
                label: user.name,
                avatar: user.avatar || user.profileImage
              }))}
              selectedValues={assigneeFilter}
              onChange={onAssigneeFilterChange}
            />
          )}

          {/* Related athletes */}
          {availableAthletes.length > 0 && (
            <AthleteSelectionDropdown
              label="Related athletes"
              options={availableAthletes.map((athlete: any) => ({ 
                value: athlete.id, 
                label: athlete.name,
                avatar: athlete.avatar || athlete.profileImage
              }))}
              selectedValues={athleteFilters}
              onChange={onAthleteFilterChange}
            />
          )}

          {/* Deadline */}
          <DateInput label="Deadline" />

          {/* Created by */}
          {availableCreators.length > 0 && (
            <AthleteSelectionDropdown
              label="Created by"
              options={availableCreators.map((user: any) => ({ 
                value: user.id, 
                label: user.name,
                avatar: user.avatar || user.profileImage
              }))}
              selectedValues={creatorFilters}
              onChange={onCreatorFilterChange}
            />
          )}

          {/* Created on */}
          <DateInput label="Created on" />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#292928] pt-[16px] pb-[24px] px-[24px]">
          <button
            onClick={clearAllFilters}
            className="bg-[#292928] hover:bg-[#3a3a38] transition-colors rounded-[9999px] h-[40px] px-[12px] py-[10px] w-full flex items-center justify-center"
          >
            <span className="font-['Montserrat:Medium',_sans-serif] text-[14px] leading-[1.46] text-[#f7f6f2]">
              Reset all
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
