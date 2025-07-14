import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Barbell, 
  CheckSquare, 
  Users, 
  ChatTeardrop, 
  PhoneCall, 
  Vault, 
  Books
} from "@phosphor-icons/react";
import logoImage from '@assets/Logo_1752265131424.png';

export function MinimalSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:bottom-auto h-[64px] md:h-screen w-full md:w-[80px] bg-[#171716] flex flex-row md:flex-col items-center justify-between md:justify-start z-50">
      {/* Logo - Hidden on mobile */}
      <div className="hidden md:block w-[64px] h-[64px] pt-6">
        <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-[16px] px-4">
        {/* To-Dos */}
        <div className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#F7F6F2]">
          <CheckSquare className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            To-Dos
          </span>
        </div>

        {/* Athletes */}
        <div className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg text-[#585856]">
          <Users className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            Athletes
          </span>
        </div>

        {/* Messages */}
        <div className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg text-[#585856]">
          <ChatTeardrop className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            Messages
          </span>
        </div>

        {/* Calls */}
        <div className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg text-[#585856]">
          <PhoneCall className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            Calls
          </span>
        </div>

        {/* Vault */}
        <div className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg text-[#585856]">
          <Vault className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            Vault
          </span>
        </div>

        {/* Libraries */}
        <Link href="/" className="flex flex-col justify-center items-center w-20 md:w-[66px] h-[48px] md:h-[68px] p-2 md:p-3 rounded-lg cursor-pointer text-[#585856] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <Books className="w-6 h-6" weight="regular" />
          <span className="text-center font-montserrat text-[10px] font-medium leading-[120%] mt-1">
            Libraries
          </span>
        </Link>
      </div>

      {/* User Profile - Hidden on mobile */}
      <div className="hidden md:flex flex-col justify-end items-center gap-2 mb-6">
        <div className="relative flex w-[40px] h-[40px] flex-col justify-center items-center rounded-[9999px] border border-[rgba(0,0,0,0.70)] bg-[#292928]">
          <span className="text-[#979795] text-center text-xs font-medium leading-[132%] font-montserrat">CH</span>
          <div className="absolute left-[-2px] bottom-[-2px] flex w-4 h-4 p-[2.667px] justify-center items-center rounded-[9999px] border border-[#1C1C1B] bg-[#3D3D3C]">
            <div className="w-2 h-2 bg-[#979795] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}