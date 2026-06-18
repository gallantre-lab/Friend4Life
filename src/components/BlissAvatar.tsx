import React from "react";
import { motion } from "motion/react";

interface BlissAvatarProps {
  state: "idle" | "speaking" | "thinking" | "happy" | "encouraging";
}

export default function BlissAvatar({ state }: BlissAvatarProps) {
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";
  const isHappy = state === "happy";
  const isEncouraging = state === "encouraging";

  return (
    <div id="bliss-avatar-container" className="relative w-36 h-36 mx-auto flex items-center justify-center p-1.5">
      {/* Interactive Purple & Green Background Glow Sphere */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-700 blur-xl opacity-45 ${
          isThinking ? "bg-purple-500 animate-pulse" :
          isSpeaking ? "bg-emerald-400 scale-105" :
          isHappy ? "bg-amber-400 scale-110" :
          isEncouraging ? "bg-green-500 scale-105" :
          "bg-indigo-500"
        }`}
      />

      {/* Floating Sparkles & Mood Twinkles */}
      {(isHappy || isEncouraging) && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
          <motion.div 
            animate={{ y: [-10, -45], opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6], rotate: [0, 90, 180] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
            className="absolute top-1 left-3 text-xs text-amber-300 font-bold"
          >
            ✦
          </motion.div>
          <motion.div 
            animate={{ y: [-5, -40], opacity: [0, 1, 0], scale: [0.5, 1.1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
            className="absolute top-3 right-4 text-sm text-green-300"
          >
            ♥
          </motion.div>
          <motion.div 
            animate={{ x: [-10, 10], y: [-5, -30], opacity: [0, 0.9, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }}
            className="absolute -top-3 left-14 text-xs text-purple-300"
          >
            ✧
          </motion.div>
        </div>
      )}

      {/* Spunky Floating Thinking Orbs */}
      {isThinking && (
        <div className="absolute -top-2 right-4 z-10 flex gap-1 pointer-events-none bg-black/60 px-2 py-0.5 rounded-full border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      {/* Outer Cosmic Rotating Ring */}
      <motion.div
        animate={{ 
          rotate: isThinking ? -360 : isSpeaking ? 180 : 0,
          scale: isSpeaking ? 1.03 : 1
        }}
        transition={isThinking ? { repeat: Infinity, duration: 12, ease: "linear" } : { duration: 0.6 }}
        className={`absolute inset-0.5 rounded-full border-2 ${
          isThinking ? "border-dashed border-purple-400/80" :
          isSpeaking ? "border-double border-green-400/80 border-4 animate-pulse" :
          isHappy ? "border-amber-400" :
          isEncouraging ? "border-green-400" :
          "border-stone-300/40"
        }`}
      />

      {/* Main Stylized Companion Avatar */}
      <motion.div
        animate={{ 
          y: isSpeaking ? [-1, 2, -1] : [-2, 3, -2],
          scale: isHappy ? [1, 1.04, 1] : 1
        }}
        transition={{ 
          repeat: Infinity, 
          duration: isSpeaking ? 2.2 : 3.8, 
          ease: "easeInOut" 
        }}
        className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-slate-950 shadow-inner ring-2 ring-stone-200/5"
      >
        <svg 
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          {/* Defined Custom Gradients & Filters */}
          <defs>
            {/* Funky dual gradients for hair combining purple base with neon green streaks */}
            <linearGradient id="funkPurpleHair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>

            <linearGradient id="funkGreenStreak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="stylizedSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffaee" />
              <stop offset="60%" stopColor="#fdf0df" />
              <stop offset="100%" stopColor="#f5deb3" />
            </linearGradient>

            <linearGradient id="jacketPurpleGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>

          {/* BACKGROUND SPACE CHIPS */}
          <rect width="120" height="120" rx="60" fill="#0c0e17" />
          <circle cx="60" cy="60" r="52" fill="#141829" />

          {/* BACKGROUND STELLA PARTICLES */}
          <circle cx="30" cy="30" r="1.5" fill="#a855f7" className="animate-pulse" />
          <circle cx="95" cy="40" r="1" fill="#22c55e" className="animate-pulse" />
          <circle cx="20" cy="80" r="1" fill="#22c55e" />

          {/* BACK HAIR VOLUME (Soft swaying, deep purple, extremely fluid) */}
          <g>
            <motion.path 
              d="M18 64 C 8 32, 112 32, 102 64 C 92 64, 28 64, 18 64 Z" 
              fill="url(#funkPurpleHair)"
              animate={{ rotate: [-1, 1.5, -1] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              style={{ originX: "60px", originY: "40px" }}
            />
          </g>

          {/* FLUID COMPANION HEAD & BODY GROUP (Swaying gently as a whole) */}
          <motion.g
            animate={{ 
              rotate: isThinking ? [-1.5, 1, -1.5] : isSpeaking ? [-1, 2, -1] : [-2, 2, -2],
              y: isSpeaking ? [-0.5, 0.5, -0.5] : [-1, 1, -1]
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            style={{ originX: "60px", originY: "90px" }}
          >
            {/* HEAD PHONE REC / HEADSET STALK */}
            <path d="M18 54 C 38 25, 82 25, 102 54" stroke="#a855f7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            
            {/* SPUNKY MIC (Blinks when speaking) */}
            <motion.path 
              d="M18 68 Q 28 84 50 82" 
              stroke="#22c55e" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
              animate={isSpeaking ? { stroke: ["#22c55e", "#a855f7", "#22c55e"] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
            <circle cx="50" cy="82" r="3" fill="#a855f7" />

            {/* SMOOTH ANIMATED EARPHONE PADS */}
            <rect x="14" y="52" width="8" height="20" rx="4" fill="#a855f7" />
            <rect x="98" y="52" width="8" height="20" rx="4" fill="#22c55e" />

            {/* FEATHER-SOFT FEMALE FACE SHAPE */}
            <path 
              d="M32 58 C 32 40, 88 40, 88 58 C 88 78, 77 90, 60 92 C 43 90, 32 78, 32 58 Z" 
              fill="url(#stylizedSkin)" 
            />

            {/* CHEEKS blush overlays that pulse with breathing and happiness */}
            <motion.circle 
              cx="44" 
              cy="73" 
              r="5" 
              fill="#ec4899" 
              animate={{ fillOpacity: isHappy ? [0.55, 0.7, 0.55] : [0.25, 0.35, 0.25] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            <motion.circle 
              cx="76" 
              cy="73" 
              r="5" 
              fill="#ec4899" 
              animate={{ fillOpacity: isHappy ? [0.55, 0.7, 0.55] : [0.25, 0.35, 0.25] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />

            {/* FRONT HAIR: ASYMMETRIC BANGS & FUNKY SIDE STRANDS */}
            {/* Long swaying purple and green side locks framing cheeks */}
            <motion.path 
              d="M28 50 C 24 58, 23 68, 25 78 C 29 78, 32 63, 31 56" 
              fill="url(#funkPurpleHair)" 
              animate={{ rotate: [-2, 4, -2] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              style={{ originX: "28px", originY: "50px" }}
            />
            <motion.path 
              d="M92 50 C 96 58, 97 68, 95 78 C 91 78, 88 63, 89 56" 
              fill="url(#funkGreenStreak)" 
              animate={{ rotate: [3, -3, 3] }}
              transition={{ repeat: Infinity, duration: 3.1, ease: "easeInOut" }}
              style={{ originX: "92px", originY: "50px" }}
            />

            {/* Main frontal bangs covering brow with gorgeous high-gloss purple gradients */}
            <path 
              d="M29 44 C 36 32, 84 32, 91 44 C 81 38, 71 39, 64 42 C 54 37, 41 38, 29 44 Z" 
              fill="url(#funkPurpleHair)" 
            />

            {/* Front Neon Green Highlights inside Bangs */}
            <path d="M38 41 Q 48 37 52 43 L 42 43 Z" fill="url(#funkGreenStreak)" />
            <path d="M70 41 Q 78 37 83 43 L 73 43 Z" fill="url(#funkGreenStreak)" />

            {/* EXPRESSIVE EYE ELEMENTS */}
            <g>
              {/* Eye blinking loop logic inside Frame group */}
              <motion.g
                animate={{ scaleY: [1, 1, 1, 1, 1, 0, 1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                style={{ originY: "66px" }}
              >
                {isHappy ? (
                  /* Joyfully curved anime eye-arcs */
                  <>
                    <path d="M37 66 Q 44 59 51 66" stroke="#3b0764" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M69 66 Q 76 59 83 66" stroke="#3b0764" strokeWidth="3" strokeLinecap="round" fill="none" />
                    
                    {/* Tiny cheerful micro-winking eyelashes */}
                    <path d="M34 65 L 31 62" stroke="#3b0764" strokeWidth="2" strokeLinecap="round" />
                    <path d="M86 65 L 89 62" stroke="#3b0764" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : isThinking ? (
                  /* Curious, looking up-right thoughtfully */
                  <>
                    {/* Left Eye */}
                    <ellipse cx="44" cy="65" rx="6" ry="7" fill="#1e1b4b" />
                    {/* Pupil looking slightly up-right */}
                    <circle cx="46" cy="63" r="3.8" fill="#9333ea" />
                    <circle cx="47" cy="61" r="1.5" fill="#ffffff" />
                    
                    {/* Right Eye */}
                    <ellipse cx="76" cy="65" rx="6" ry="7" fill="#1e1b4b" />
                    {/* Pupil looking slightly up-right */}
                    <circle cx="78" cy="63" r="3.8" fill="#22c55e" />
                    <circle cx="79" cy="61" r="1.5" fill="#ffffff" />

                    {/* Intellectual curious eyebrows */}
                    <path d="M36 54 Q 43 51 49 55" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M71 56 Q 76 51 83 54" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </>
                ) : isEncouraging ? (
                  /* Anime sparkles & double shine */
                  <>
                    {/* Left Eye */}
                    <ellipse cx="44" cy="66" rx="6.5" ry="7.5" fill="#1e1b4b" />
                    <circle cx="44" cy="66" r="4.2" fill="#22c55e" />
                    <polygon points="43,65 45,63 44,67" fill="#ffffff" />
                    <circle cx="42" cy="68" r="1" fill="#ffffff" />
                    
                    {/* Right Eye */}
                    <ellipse cx="76" cy="66" rx="6.5" ry="7.5" fill="#1e1b4b" />
                    <circle cx="76" cy="66" r="4.2" fill="#a855f7" />
                    <polygon points="75,65 77,63 76,67" fill="#ffffff" />
                    <circle cx="74" cy="68" r="1" fill="#ffffff" />

                    {/* Cheerful high arched eyebrows */}
                    <path d="M37 54 Q 44 49 50 53" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M70 53 Q 76 49 83 54" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  </>
                ) : (
                  /* IDLE: Genuinely fluid character pupils that shimmer slightly with micro-shifts */
                  <>
                    {/* Left Eye Container */}
                    <ellipse cx="44" cy="66" rx="6.5" ry="7.5" fill="#15122e" />
                    {/* Animated pupil shifting slightly */}
                    <motion.ellipse 
                      cx="44.5" 
                      cy="66" 
                      rx="4.8" 
                      ry="5.8" 
                      fill="#9333ea" 
                      animate={{ x: [-0.5, 0.5, -0.5], y: [-0.2, 0.2, -0.2] }}
                      transition={{ repeat: Infinity, duration: 4.8 }}
                    />
                    {/* Twin sparkly reflections */}
                    <circle cx="42.5" cy="63.5" r="1.8" fill="#ffffff" />
                    <circle cx="46" cy="68.5" r="0.8" fill="#22c55e" />

                    {/* Right Eye Container */}
                    <ellipse cx="76" cy="66" rx="6.5" ry="7.5" fill="#15122e" />
                    {/* Animated pupil shifting slightly */}
                    <motion.ellipse 
                      cx="75.5" 
                      cy="66" 
                      rx="4.8" 
                      ry="5.8" 
                      fill="#22c55e" 
                      animate={{ x: [-0.5, 0.5, -0.5], y: [-0.2, 0.2, -0.2] }}
                      transition={{ repeat: Infinity, duration: 4.8 }}
                    />
                    {/* Twin sparkly reflections */}
                    <circle cx="74.5" cy="63.5" r="1.8" fill="#ffffff" />
                    <circle cx="78" cy="68.5" r="0.8" fill="#9333ea" />

                    {/* Calm, cozy eyebrows */}
                    <path d="M37 55 Q 44 52 50 55" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M70 55 Q 76 52 83 55" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </>
                )}
              </motion.g>
            </g>

            {/* DYNAMIC EXPRESSIVE FEMALE MOUTH */}
            {isHappy ? (
              /* High-fidelity open smile */
              <path d="M53 77 Q 60 86 67 77 Z" fill="#f43f5e" stroke="#3b0764" strokeWidth="1.5" />
            ) : isSpeaking ? (
              /* Lip-sync effect morphing with motion features */
              <motion.ellipse 
                cx="60" 
                cy="78" 
                rx="4" 
                ry="3" 
                fill="#4a044e" 
                stroke="#fda4af" 
                strokeWidth="1"
                animate={{ ry: [2, 5.5, 2.5, 6, 2], rx: [4, 3, 4.5, 3.2, 4] }}
                transition={{ repeat: Infinity, duration: 0.35 }}
              />
            ) : isThinking ? (
              /* Small cute line of concentration */
              <path d="M55 78 Q 60 80 65 78" stroke="#3b0764" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : isEncouraging ? (
              /* Warm supportive grin */
              <path d="M53 76 Q 60 83 67 76" stroke="#4a044e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : (
              /* Cute simple friendly resting smirk */
              <path d="M54 76 Q 60 80 66 76" stroke="#4a044e" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}

            {/* ATHLETIC OVERCOAT (Sporty lines, purple & green windbreaker panels) */}
            <path d="M34 92 C 34 92, 21 106, 12 120 C 26 120, 94 120, 108 120 C 99 106, 86 92, 86 92" fill="url(#jacketPurpleGreen)" />
            
            {/* Windbreaker Collar V-Neck and silver metallic zipper */}
            <path d="M43 92 L 60 106 L 77 92" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <line x1="60" y1="106" x2="60" y2="120" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          {/* ASYMMETRIC FLICK HAIRSTYLE HAIR SPIKES (Swaying at topmost area of the character, giving hair dimension) */}
          <motion.path 
            d="M32 30 L 25 18 L 42 25 Z" 
            fill="url(#funkGreenStreak)" 
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ originX: "32px", originY: "30px" }}
          />
          <motion.path 
            d="M88 30 L 95 18 L 78 25 Z" 
            fill="url(#funkPurpleHair)" 
            animate={{ rotate: [3, -3, 3] }}
            transition={{ repeat: Infinity, duration: 3.7, ease: "easeInOut" }}
            style={{ originX: "88px", originY: "30px" }}
          />
          <motion.path 
            d="M48 22 L 60 8 L 72 20 Z" 
            fill="url(#funkGreenStreak)" 
            animate={{ y: [-0.5, 0.8, -0.5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

        </svg>
      </motion.div>
    </div>
  );
}
