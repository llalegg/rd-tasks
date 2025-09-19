import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  badge?: React.ReactNode;
  selected?: boolean;
}

interface InteractiveRowProps {
  label: string;
  value: string;
  badge: React.ReactNode;
  options?: DropdownOption[];
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  badgeClickable?: boolean;
  onBadgeClick?: () => void;
}

export function InteractiveRow({
  label,
  value,
  badge,
  options,
  onValueChange,
  disabled = false,
  badgeClickable = false,
  onBadgeClick
}: InteractiveRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRowClick = () => {
    if (!disabled && options && options.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (badgeClickable && onBadgeClick) {
      e.stopPropagation();
      onBadgeClick();
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (optionValue !== value && onValueChange) {
      onValueChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div 
      ref={rowRef}
      className={`
        relative bg-transparent rounded-lg p-0 transition-colors duration-200 
        ${!disabled ? 'cursor-pointer hover:bg-[#1c1c1b]' : 'cursor-default'}
      `}
      onClick={handleRowClick}
    >
      {/* Row Content */}
      <div className="flex items-center justify-between px-2 h-8">
        <div className="flex items-center gap-1 flex-1">
          <div 
            className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0"
            style={{ 
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              width: '108px'
            }}
          >
            {label}
          </div>
          <div onClick={handleBadgeClick} className={badgeClickable ? 'cursor-pointer' : ''}>
            {badge}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && options && options.length > 0 && (
        <div 
          className="absolute top-full left-2 right-2 bg-[#292928] border border-[#3d3d3c] rounded-xl py-1 shadow-lg z-10 transform transition-all duration-200"
          style={{
            boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transform: isOpen ? 'translateY(0)' : 'translateY(-10px)'
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`
                flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2
                hover:bg-[rgba(255,255,255,0.04)]
                ${option.value === value ? 'bg-[rgba(255,255,255,0.04)]' : ''}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleOptionClick(option.value);
              }}
            >
              <div 
                className="font-normal text-sm leading-[1.46] text-[#f7f6f2] flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400
                }}
              >
                {option.label}
              </div>
              {option.value === value && (
                <Check 
                  className="w-6 h-6 text-[#f7f6f2] flex-shrink-0"
                  style={{
                    mask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M1 5l4 4 9-9'/%3E%3C/svg%3E\") no-repeat center",
                    maskSize: 'contain',
                    background: 'currentColor'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
