'use client';

import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AIRawScene() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [showChapter1, setShowChapter1] = useState(false);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsIntroDone(true);
    }, 5000);

    const timer2 = setTimeout(() => {
      setShowChapter1(true);
    }, 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const chapter1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const grandmaOpacity = useTransform(smoothProgress, [0.25, 0.4], [0, 1]);

  const videoSrc = '/demo1.mp4';

  const handleVideoError = () => {
    const code = videoRef.current?.error?.code;
    const reasonMap = {
      1: 'Video load aborted',
      2: 'Network error loading video',
      3: 'Video decode error',
      4: 'Video format not supported',
    };
    setVideoError(reasonMap[code] || 'Video load failed');
  };

  return (
    <div className="relative h-[400vh] w-full bg-black selection:bg-black/10 overflow-x-hidden">
      <motion.div 
        className="fixed inset-0 z-10 bg-black overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.video 
            ref={videoRef}
            src={videoSrc} 
            autoPlay 
            loop 
            muted={false}
            preload="auto"
            playsInline 
            onError={handleVideoError}
            animate={{ 
              filter: isIntroDone 
                ? "grayscale(100%) contrast(125%) brightness(110%)" 
                : "grayscale(0%) contrast(100%) brightness(100%)" 
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full h-full object-cover"
          />
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white px-6 text-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] opacity-80">Video Load Error</p>
                <p className="mt-3 text-base md:text-lg">{videoError}</p>
                <p className="mt-2 text-xs md:text-sm opacity-80">Location: {videoSrc}</p>
              </div>
            </div>
          )}
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isIntroDone ? 0.7 : 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_0%,white_100%)]" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isIntroDone ? 0.3 : 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pointer-events-none bg-black" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isIntroDone ? 0.9 : 0 }}
            transition={{ duration: 2.5 }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white blur-[120px]" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isIntroDone ? 0.9 : 0 }}
            transition={{ duration: 2.5 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white blur-[150px]" 
          />
        </div>
      </motion.div>

      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
          {showChapter1 && (
            <motion.div 
              style={{ opacity: chapter1Opacity }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            >
              <div className="text-[14px] uppercase font-bold opacity-80 mb-[12px] tracking-[0.3em] text-white">Segment 01</div>
              <h1 className="font-serif text-[64px] font-bold italic mb-[8px] leading-none text-white drop-shadow-lg">Chapter 1</h1>
              <p className="font-serif text-[18px] font-bold opacity-90 lowercase text-white drop-shadow-md">story preface</p>
              <div className="mt-12 h-px w-12 mx-auto bg-white/50" />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                className="mt-8 text-[12px] font-bold uppercase tracking-[0.2em] text-white animate-pulse"
              >
                Scroll to Begin
              </motion.div>
            </motion.div>
          )}

          <motion.div 
            style={{ opacity: grandmaOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-[0.15em] leading-[1.8] drop-shadow-2xl">
              我的奶奶，<br/>
              是一名和平县的客家人
            </h2>
            <div className="mt-12 flex flex-col items-center space-y-4">
              <div className="h-12 w-px bg-white/40" />
              <p className="text-white/80 text-[12px] font-bold uppercase tracking-[0.4em] animate-bounce">
                Keep Scrolling
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
        className="fixed bottom-8 right-8 z-50 p-3 bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full border border-black/10 transition-all duration-300 group"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-black/40" /> : <Volume2 className="w-5 h-5 text-black/80" />}
      </button>
    </div>
  );
}
