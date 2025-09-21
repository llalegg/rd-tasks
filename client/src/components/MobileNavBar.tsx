import React from "react";
import { 
  CheckSquare, 
  Users, 
  MessageCircle, 
  Phone, 
  Shield
} from "lucide-react";

export function MobileNavBar() {
  return (
    <div className="bg-[#0d0d0c] box-border flex flex-col gap-[8px] h-[76px] items-center justify-center px-[16px] py-[12px] shadow-[0px_-8px_24px_0px_rgba(0,0,0,0.24)] w-full">
      <div className="flex items-center justify-center w-full h-full">
        {/* Tasks - Active */}
        <div className="flex-1 bg-[rgba(255,255,255,0.04)] flex flex-col gap-[8px] h-full items-center justify-center px-[12px] rounded-[8px]">
          <CheckSquare className="w-6 h-6 text-[#f7f6f2]" />
          <span className="font-montserrat text-[10px] font-medium leading-[1.2] text-[#f7f6f2] text-center">
            Tasks
          </span>
        </div>

        {/* Athletes */}
        <div className="flex-1 flex flex-col gap-[8px] h-full items-center justify-center px-[12px] rounded-[8px]">
          <Users className="w-6 h-6 text-[#585856]" />
          <span className="font-montserrat text-[10px] font-medium leading-[1.2] text-[#585856] text-center">
            Athletes
          </span>
        </div>

        {/* Messages - With counter */}
        <div className="relative flex-1 flex flex-col gap-[8px] h-full items-center justify-center px-[12px] rounded-[8px]">
          <MessageCircle className="w-6 h-6 text-[#585856]" />
          <span className="font-montserrat text-[10px] font-medium leading-[1.2] text-[#585856] text-center">
            Messages
          </span>
          {/* Counter Badge */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 translate-y-2 bg-[#979795] min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5">
            <span className="text-black font-montserrat text-[12px] font-semibold leading-[1.32]">99+</span>
          </div>
        </div>

        {/* Calls */}
        <div className="flex-1 flex flex-col gap-[8px] h-full items-center justify-center px-[12px] rounded-[8px]">
          <Phone className="w-6 h-6 text-[#585856]" />
          <span className="font-montserrat text-[10px] font-medium leading-[1.2] text-[#585856] text-center">
            Calls
          </span>
        </div>

        {/* Vault */}
        <div className="flex-1 flex flex-col gap-[8px] h-full items-center justify-center px-[12px] rounded-[8px]">
          <Shield className="w-6 h-6 text-[#585856]" />
          <span className="font-montserrat text-[10px] font-medium leading-[1.2] text-[#585856] text-center">
            Vault
          </span>
        </div>
      </div>
    </div>
  );
}
