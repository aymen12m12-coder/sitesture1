import React, { useEffect, useState } from 'react';
import { useUiSettings } from '@/context/UiSettingsContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { getSetting } = useUiSettings();
  const [show, setShow] = useState(true);

  const splashImageUrl = getSetting('splash_image_url', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800');
  const splashTitle = getSetting('splash_title', 'مرحباً بك في طمطوم');
  const splashSubtitle = getSetting('splash_subtitle', 'خضروات وفواكه طازجة تصلك لباب بيتك بأعلى جودة وأفضل سعر');

  const handleStart = () => {
    setShow(false);
    setTimeout(onFinish, 500); // Allow animation to finish
  };

  if (!show) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] transition-opacity duration-500 opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col transition-opacity duration-500">
      <div className="flex-1 relative overflow-hidden">
        <img 
          src={splashImageUrl} 
          alt="Splash" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-20 left-0 right-0 p-8 text-white text-center">
          <div className="mb-6 flex justify-center">
             <div className="text-5xl md:text-7xl flex items-center font-black tracking-tighter select-none bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl">
              <span className="text-[#388e3c]">طم</span>
              <span className="text-[#d32f2f]">طوم</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg">{splashTitle}</h1>
          <p className="text-lg md:text-xl font-medium opacity-90 leading-relaxed max-w-md mx-auto drop-shadow-md">
            {splashSubtitle}
          </p>
        </div>
      </div>
      
      <div className="p-8 bg-white">
        <Button 
          onClick={handleStart}
          className="w-full h-16 rounded-2xl text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          ابدأ الآن
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SplashScreen;
