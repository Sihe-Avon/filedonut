'use client'

import * as React from 'react'
import { useEffect, useState, JSX } from 'react'

const DONUT_KEYWORDS = 'donut,cartoon,illustration,2d'
const UNSPLASH_URL = `https://source.unsplash.com/600x600/?${DONUT_KEYWORDS}`

const DonutSVG = ({ isRotating }: { isRotating?: boolean }): JSX.Element => (
  <div className={`relative w-[180px] h-[180px] mx-auto ${isRotating ? 'animate-spin-slow' : ''}`}>
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="90" cy="90" rx="80" ry="80" fill="#fffbe7" />
      <ellipse cx="90" cy="90" rx="70" ry="70" fill="#fbbf24" />
      <ellipse cx="90" cy="90" rx="40" ry="40" fill="#fffbe7" />
      <ellipse cx="90" cy="90" rx="30" ry="30" fill="#fff" />
      <path d="M120 70 Q130 90 120 110 Q110 130 90 120 Q70 110 80 90 Q90 70 120 70 Z" fill="#f59e42" opacity="0.5"/>
      <circle cx="110" cy="80" r="6" fill="#fff"/>
      <circle cx="70" cy="110" r="4" fill="#fff"/>
      <circle cx="100" cy="120" r="3" fill="#fff"/>
      <circle cx="120" cy="100" r="2.5" fill="#fff"/>
      <circle cx="80" cy="80" r="2.5" fill="#fff"/>
      <circle cx="100" cy="70" r="2.5" fill="#fff"/>
      <circle cx="90" cy="100" r="2.5" fill="#fff"/>
      <circle cx="110" cy="110" r="2.5" fill="#fff"/>
      <circle cx="130" cy="90" r="2.5" fill="#fff"/>
    </svg>
    <svg
      className="absolute inset-0 m-auto w-20 h-20 pointer-events-none drop-shadow-lg"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Upload arrow"
    >
      <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.7)"/>
      <path d="M32 48V16M32 16L20 28M32 16L44 28" stroke="#f59e42" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
)

function Donut(): JSX.Element {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return <DonutSVG />
  }

  return (
    <div className="relative w-[320px] h-[260px] mx-auto mt-6">
      <img
        src="/donut.png"
        alt="Donut illustration"
        className="w-full h-full object-contain drop-shadow-lg"
        draggable={false}
        onError={() => setImgError(true)}
      />
    </div>
  )
}

export default function Spinner({ direction }: { direction: 'up' | 'down' }): JSX.Element {
  return <Donut />
}
