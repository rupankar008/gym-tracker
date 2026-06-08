const BodybuilderLogo = ({ size = 60, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Shield Background in deep fitness blue */}
      <path 
        d="M 30,25 Q 60,20 90,25 C 90,55 75,85 60,95 C 45,85 30,55 30,25 Z" 
        fill="#0f4c81" 
        stroke="rgba(255,255,255,0.1)" 
        strokeWidth="2" 
      />

      {/* 2. Bodybuilder lifting weights (Silhouette inside shield) */}
      {/* Torso & Broad Shoulders */}
      <path 
        d="M 52,68 C 50,65 54,58 52,54 C 48,53 45,50 42,46 C 47,46 51,48 55,50 C 56,48 57,48 58,50 C 62,48 66,46 71,46 C 68,50 65,53 61,54 C 59,58 63,65 61,68 Z" 
        fill="#ffffff" 
      />
      {/* Abs lines */}
      <line x1="56" y1="58" x2="56" y2="64" stroke="#0f4c81" strokeWidth="1.5" />
      <line x1="54" y1="60" x2="58" y2="60" stroke="#0f4c81" strokeWidth="1" />
      <line x1="54" y1="62" x2="58" y2="62" stroke="#0f4c81" strokeWidth="1" />
      
      {/* Head */}
      <circle cx="56" cy="40" r="5" fill="#ffffff" />

      {/* Uplifted arms */}
      <path 
        d="M 42,46 C 38,40 38,32 46,30 L 46,33 C 41,35 41,41 44,45 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 70,46 C 74,40 74,32 66,30 L 66,33 C 71,35 71,41 68,45 Z" 
        fill="#ffffff" 
      />

      {/* Bending orange barbell */}
      <path 
        d="M 32,28 Q 56,22 80,28" 
        fill="none" 
        stroke="#ff6f00" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      {/* Barbell weights */}
      <circle cx="30" cy="28" r="8" fill="#ff6f00" />
      <circle cx="32" cy="28" r="5" fill="#ffffff" opacity="0.3" />
      <circle cx="82" cy="28" r="8" fill="#ff6f00" />
      <circle cx="80" cy="28" r="5" fill="#ffffff" opacity="0.3" />

      {/* 3. Orange Swoosh Arrow wrapping shield */}
      <path 
        d="M 22,65 C 28,88 52,98 68,92 C 84,86 98,62 92,34" 
        fill="none" 
        stroke="#ff6f00" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      {/* Arrowhead */}
      <path 
        d="M 86,38 L 93,31 L 95,40" 
        fill="none" 
        stroke="#ff6f00" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default BodybuilderLogo;
