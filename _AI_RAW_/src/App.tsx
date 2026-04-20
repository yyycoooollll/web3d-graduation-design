import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Starfield } from './components/Starfield';
import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [showChapter1, setShowChapter1] = useState(false);

  useEffect(() => {
    // Stage 1: Normal playback for 5 seconds
    const timer1 = setTimeout(() => {
      setIsIntroDone(true);
    }, 5000);

    // Stage 2: Show Chapter 1 after vignette starts fading in
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

  // Scroll logic for text switching (Scene 1)
  // Chapter 1 fades out [0 to 0.2], Grandma fades in [0.25 to 0.5]
  const chapter1Opacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const grandmaOpacity = useTransform(smoothProgress, [0.25, 0.4], [0, 1]);

  // Background shift logic (Scene 2)
  // Background stays fixed at y: 0 during text switching [0-0.6], 
  // then moves up to reveal starfield [0.7-1].
  const backgroundY = useTransform(smoothProgress, [0.7, 1], ["0%", "-100%"]);
  const starfieldY = useTransform(smoothProgress, [0.7, 1], ["100%", "0%"]);

  return (
    <div className="relative h-[400vh] w-full bg-bg-deep selection:bg-black/10 overflow-x-hidden">
      {/* Background Layers */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-10 bg-black overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.video 
            ref={videoRef}
            src="/demo1.mp4" 
            autoPlay 
            loop 
            muted
            playsInline 
            animate={{ 
              filter: isIntroDone 
                ? "grayscale(100%) contrast(125%) brightness(110%)" 
                : "grayscale(0%) contrast(100%) brightness(100%)" 
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full h-full object-cover"
          />
          
          {/* Artistic Filters (Fade in after 5s) */}
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

      {/* Starfield revealed during scroll */}
      <motion.div style={{ y: starfieldY }} className="fixed inset-0 z-0">
        <Starfield progress={scrollYProgress} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,8,0.8)_100%)]" />
      </motion.div>

      {/* Centered Text Layer - Shared Container for Same Position Switching */}
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
          {/* Chapter 1 - Absolute Centered */}
          <motion.div 
            style={{ opacity: chapter1Opacity }}
            animate={{ 
              opacity: showChapter1 ? chapter1Opacity.get() : 0,
              y: showChapter1 ? 0 : 20 
            }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="text-[14px] uppercase font-bold opacity-80 mb-[12px] tracking-[0.3em] text-white">Segment 01</div>
            <h1 className="font-serif text-[64px] font-bold italic mb-[8px] leading-none text-white drop-shadow-lg">Chapter 1</h1>
            <p className="font-serif text-[18px] font-bold opacity-90 lowercase text-white drop-shadow-md">story preface</p>
            <div className="mt-12 h-px w-12 mx-auto bg-white/50" />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showChapter1 ? 0.8 : 0 }}
              className="mt-8 text-[12px] font-bold uppercase tracking-[0.2em] text-white animate-pulse"
            >
              Scroll to Begin
            </motion.div>
          </motion.div>

          {/* Grandma Text - Absolute Centered at same spot */}
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

      {/* Audio Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
        className="fixed bottom-8 right-8 z-50 p-3 bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full border border-black/10 transition-all duration-300 group"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-black/40" /> : <Volume2 className="w-5 h-5 text-black/80" />}
      </button>
    </div>
  );
}
