import React from "react";

export const WalletIllustration = ({ className = "w-28 h-24 sm:w-32 sm:h-28" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Ambient Glow / Drop Shadow */}
          <radialGradient id="shadowGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f0728" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f0728" stopOpacity="0" />
          </radialGradient>

          {/* Wallet Base 3D Gradient */}
          <linearGradient id="walletBody" x1="20" y1="35" x2="140" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4c3d78" />
            <stop offset="45%" stopColor="#2e2154" />
            <stop offset="100%" stopColor="#1e133c" />
          </linearGradient>

          {/* Wallet Top Highlight */}
          <linearGradient id="walletTopRim" x1="20" y1="35" x2="140" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8d7ec3" />
            <stop offset="100%" stopColor="#554483" />
          </linearGradient>

          {/* Card 1 - Back Card */}
          <linearGradient id="cardBack" x1="35" y1="10" x2="105" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>

          {/* Card 2 - Front Card */}
          <linearGradient id="cardFront" x1="45" y1="20" x2="120" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>

          {/* Clasp button metallic */}
          <linearGradient id="metalClasp" x1="122" y1="68" x2="134" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Clasp flap shadow */}
          <filter id="claspShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="-1" dy="2" stdDeviation="2" floodColor="#0f0728" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Floating Shadow Below */}
        <ellipse cx="80" cy="128" rx="55" ry="10" fill="url(#shadowGlow)" />

        {/* Back Card (slipping out, rotated slightly) */}
        <g transform="rotate(-6 70 30)">
          <rect x="36" y="14" width="68" height="42" rx="7" fill="url(#cardBack)" />
          {/* Magnetic stripe / chip lines */}
          <rect x="42" y="22" width="18" height="12" rx="3" fill="#a5b4fc" opacity="0.7" />
          <line x1="42" y1="42" x2="80" y2="42" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* Front Card (slipping out upright) */}
        <g transform="rotate(4 82 34)">
          <rect x="48" y="16" width="70" height="44" rx="7" fill="url(#cardFront)" />
          {/* Card details */}
          <rect x="55" y="24" width="16" height="11" rx="2.5" fill="#fcd34d" opacity="0.9" />
          <line x1="55" y1="44" x2="100" y2="44" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <circle cx="106" cy="27" r="4" fill="#f87171" opacity="0.7" />
          <circle cx="101" cy="27" r="4" fill="#fbbf24" opacity="0.7" />
        </g>

        {/* 3D Wallet Main Body */}
        <path
          d="M24 45 C24 38 30 34 38 34 L126 34 C134 34 140 38 140 45 L140 102 C140 112 132 118 122 118 L42 118 C30 118 24 110 24 100 Z"
          fill="url(#walletBody)"
        />

        {/* Top Rim Highlight */}
        <path
          d="M24 45 C24 38 30 34 38 34 L126 34 C134 34 140 38 140 45 L140 48 L24 48 Z"
          fill="url(#walletTopRim)"
          opacity="0.6"
        />

        {/* Front Pocket Seam */}
        <path
          d="M24 64 C40 67 110 65 140 61 L140 102 C140 112 132 118 122 118 L42 118 C30 118 24 110 24 100 Z"
          fill="#251944"
          opacity="0.85"
        />

        {/* Accent Edge Curve Line */}
        <path
          d="M26 65 Q80 72 138 62"
          stroke="#5e498c"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* Clasp Flap */}
        <g filter="url(#claspShadow)">
          <path
            d="M116 64 C116 60 120 58 124 58 L142 58 L142 86 L124 86 C120 86 116 84 116 80 Z"
            fill="#3b2b63"
          />
          {/* Clasp Snap Button Metallic */}
          <circle cx="128" cy="72" r="5.5" fill="url(#metalClasp)" />
          <circle cx="128" cy="72" r="3" fill="#ffffff" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};

