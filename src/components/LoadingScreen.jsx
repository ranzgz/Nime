import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0c] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#F6CF80]/20 border-t-[#F6CF80] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <img src="https://raw.githubusercontent.com/alip-jmbd/alipp/main/icon-rbg.png" className="w-8 h-8 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;