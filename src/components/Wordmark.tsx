import * as React from 'react'

export default function Wordmark(): React.JSX.Element {
  return (
    <span
      className="font-bold text-[2.5rem] md:text-[3.5rem] text-[#ff914d] drop-shadow-[0_2px_8px_rgba(255,145,77,0.10)] tracking-tight select-none dark:text-[#f59e42] dark:drop-shadow-lg"
      style={{ fontFamily: 'Fredoka One, Luckiest Guy, Poppins, sans-serif' }}
      aria-label="FileDonut logo"
      role="img"
    >
      FileDonut
    </span>
  )
}
