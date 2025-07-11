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

export function MinimalSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:bottom-auto h-[64px] md:h-screen w-full md:w-[80px] bg-[#171716] flex flex-row md:flex-col items-center justify-between md:justify-start z-50">
      {/* Logo - Hidden on mobile */}
      <div className="hidden md:block w-[48px] h-[40.235px] pt-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="42" viewBox="0 0 48 42" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M35.5026 30.6874C34.7085 29.3762 34.1153 28.1293 33.3629 26.484L33.3573 26.4665C32.7969 24.5434 31.1802 23.0382 29.7148 21.8166C29.8299 21.7689 29.9508 21.7195 30.0762 21.6682C31.4404 21.1107 33.3329 20.3372 33.9821 19.1862C34.0267 19.1076 34.0728 19.0274 34.1196 18.9457C34.5085 18.268 34.9526 17.4939 35.0776 16.7897C35.4194 14.8696 33.8224 14.8199 32.2365 14.8696L32.2496 14.804C32.518 13.4621 32.7266 12.4188 32.5391 11.2397C32.3516 10.0607 31.7653 8.74155 30.7821 7.6423C29.7989 6.54305 28.418 5.6638 26.6393 5.00459C24.8606 4.34538 22.684 3.90614 20.7639 4.02124C18.8438 4.13634 17.1797 4.80681 16.6217 5.94798C16.0637 7.08915 16.6121 8.69522 17.6448 10.0742C18.6775 11.4532 20.194 12.6053 21.6494 13.6245C23.1048 14.6437 24.4988 15.5305 25.2929 16.8417C26.087 18.1529 26.2817 19.8884 26.8774 21.5059C27.473 23.1234 28.4696 24.623 29.7653 25.7222C31.061 26.8214 32.6547 27.5196 33.8224 28.6188C34.9901 29.7181 35.7309 31.2176 35.6456 32.4196C35.5603 33.6216 34.6481 34.5259 33.4804 35.0265C32.3127 35.5271 30.8896 35.6246 29.5938 35.3198C28.2981 35.015 27.1304 34.3081 26.1338 33.2089C25.1372 32.1097 24.3123 30.6179 23.7156 28.9979C23.1189 27.3779 22.7497 25.6298 22.6081 23.8817C22.4665 22.1336 22.5518 20.3855 23.8475 19.2863C25.1432 18.1871 27.6488 17.7362 30.0226 17.6874L29.9575 17.5149C29.6891 16.8167 29.5085 16.0698 29.4158 15.3229C29.3231 14.576 29.318 13.8291 29.4007 13.0822C29.4835 12.3353 29.6541 11.5884 29.9124 10.8415C30.1708 10.0946 30.5169 9.34768 30.9507 8.60074C31.3846 7.8538 31.9061 7.10686 32.5154 6.35992C33.1247 5.61298 33.8218 4.86604 34.6066 4.1191C35.3915 3.37216 36.2641 2.62522 37.2245 1.87828C38.1849 1.13134 39.2332 0.384403 40.3693 -0.362537L40.3693 -0.36254Z" fill="#F7F6F2"/>
        </svg>
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
          <span className="text-[#979795] text-center text-xs font-medium leading-[132%] font-montserrat">JD</span>
          <div className="absolute left-[-2px] bottom-[-2px] flex w-4 h-4 p-[2.667px] justify-center items-center rounded-[9999px] border border-[#1C1C1B] bg-[#3D3D3C]">
            <div className="w-2 h-2 bg-[#979795] rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}