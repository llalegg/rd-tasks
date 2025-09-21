import React from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="bg-[#0d0d0c] flex flex-col h-screen w-full">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0d0d0c] flex items-center justify-center px-[16px] py-0 h-[48px] w-full">
        <div className="flex-1 flex items-center px-0 py-[16px]">
          <h1 className="font-montserrat text-[18px] font-semibold leading-[1.54] text-[#f7f6f2]">
            Tasks
          </h1>
        </div>
        
        {/* Avatar Button with Notification */}
        <div className="flex items-center justify-center w-[48px] h-[48px] relative">
          <div 
            className="w-[32px] h-[32px] rounded-full bg-cover bg-center border border-[#292928]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face')" }}
          />
          {/* Notification dot */}
          <div className="absolute top-0 right-0 w-[24px] h-[24px] flex items-center justify-center">
            <div className="w-[8px] h-[8px] bg-[#ff4444] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Fixed Search and Actions */}
      <div className="fixed top-[48px] left-0 right-0 z-30 bg-[#0d0d0c] flex flex-col gap-[16px] items-start p-[16px] w-full">
        <div className="flex gap-[16px] items-start w-full">
          {/* Search Field */}
          <div className="flex-1 bg-[#292928] flex items-center px-[12px] py-[8px] rounded-[8px] h-[32px]">
            <div className="flex gap-[10px] items-center flex-1">
              <Search className="w-4 h-4 text-[#f7f6f2]" />
              <span className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#979795]">
                Search by task name
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-[8px] items-center">
            {/* Filter Button */}
            <div className="bg-[#292928] flex items-center justify-center p-[6px] rounded-full w-[32px] h-[32px]">
              <SlidersHorizontal className="w-4 h-4 text-[#f7f6f2]" />
            </div>
            
            {/* Add Button */}
            <div className="bg-[#e5e4e1] flex items-center justify-center p-[6px] rounded-full w-[32px] h-[32px]">
              <Plus className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 pt-[112px] pb-[92px] overflow-hidden">
        <div className="h-full overflow-y-auto px-[16px]">
          {children}
        </div>
      </div>
    </div>
  );
}
