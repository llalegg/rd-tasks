import React from "react";
import { Link, useLocation } from "wouter";
import { 
  CheckSquare, 
  Users, 
  MessageCircle, 
  Phone, 
  Shield, 
  BookOpen,
  Bell
} from "lucide-react";

export function MinimalSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[80px] bg-[#171716] flex flex-col items-center z-50 hidden min-[640px]:flex">
      {/* Navigation Items - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-[16px]">
        {/* Tasks - Selected/Active */}
        <div className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] bg-[rgba(255,255,255,0.04)] text-[#F7F6F2]">
          <CheckSquare className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Tasks
          </span>
        </div>

        {/* Athletes */}
        <div className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <Users className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Athletes
          </span>
        </div>

        {/* Messages - With counter */}
        <div className="relative flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <MessageCircle className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Messages
          </span>
          {/* Counter Badge */}
          <div className="absolute -top-1 -right-1 bg-[#979795] min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5">
            <span className="text-black font-montserrat text-[12px] font-semibold leading-[1.32]">99+</span>
          </div>
        </div>

        {/* Staff */}
        <div className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <Users className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Staff
          </span>
        </div>

        {/* Calls */}
        <div className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <Phone className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Calls
          </span>
        </div>

        {/* Vault */}
        <div className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <Shield className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Vault
          </span>
        </div>

        {/* Library */}
        <Link href="/" className="flex flex-col justify-center items-center w-[66px] h-[68px] p-3 rounded-[8px] text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer">
          <BookOpen className="w-6 h-6" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[1.2] mt-2">
            Library
          </span>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-2 mb-6">
        {/* Notification Bell */}
        <div className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer">
          <Bell className="w-6 h-6 text-[#F7F6F2]" />
        </div>

        {/* User Avatar */}
        <div className="w-[40px] h-[40px] rounded-full bg-cover bg-center border border-[rgba(0,0,0,0.7)]" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face')" }}>
        </div>
      </div>
    </aside>
  );
}