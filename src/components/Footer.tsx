'use client'

import React, { JSX, useCallback } from 'react'

const DONATE_HREF =
  'https://ko-fi.com/sihesonic'

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <a
      className="text-stone-600 dark:text-stone-400 underline hover:text-stone-800 dark:hover:text-stone-200"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export function Footer(): JSX.Element {
  const handleDonate = useCallback(() => {
    window.location.href = DONATE_HREF
  }, [])

  return (
    <>
      <footer className="text-xs border-t border-stone-200 dark:border-stone-700 shadow-[0_-1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_-1px_2px_rgba(255,255,255,0.04)] bg-stone-100/90 dark:bg-black/80 backdrop-blur z-40 h-[60px] flex items-center relative">
        <div className="w-full flex flex-row items-center justify-center h-full gap-3 px-4">
          <div className="flex flex-col items-center text-center">
            <span className="font-semibold text-xs">Enjoying FileDonut?</span>
            <span className="font-normal text-xs">Help keep the donuts rolling!</span>
          </div>
          <button
            className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-full shadow hover:scale-105 transition font-medium text-xs w-auto shrink-0"
            onClick={handleDonate}
          >
            <span role="img" aria-label="donut">🍩</span> Donate
          </button>
        </div>
        <a
          href="https://github.com/kern/filepizza"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="hidden sm:absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-stone-300 dark:border-stone-700 shadow-lg p-1.5 hover:bg-gray-100 dark:hover:bg-stone-700 transition"
          style={{ width: '28px', height: '28px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#fff" className="dark:fill-black" />
            <path d="M12 0.297C5.373 0.297 0 5.67 0 12.297c0 5.292 3.438 9.773 8.205 11.387.6.111.82-.261.82-.577 0-.285-.011-1.04-.017-2.042-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.004.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.625-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.218.694.825.576C20.565 22.067 24 17.587 24 12.297c0-6.627-5.373-12-12-12" fill="#18181b" className="dark:fill-white" />
          </svg>
        </a>
      </footer>
    </>
  )
}

export default Footer
