import React, { useState } from 'react'

interface IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  icon: React.ReactNode
  variant: 'primary' | 'secondary'
  offsetLeft?: number
}

const VARIANTS = {
  primary: {
    bg: 'green',
    bgHover: '#007100',
  },
  secondary: {
    bg: '#E2ECE2',
    bgHover: '#C8E6C8',
  },
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, variant, offsetLeft = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)
  const colors = VARIANTS[variant]

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? colors.bgHover : colors.bg,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        padding: 0,
        border: 'none',
        position: 'absolute',
        top: '-64px',
        left: offsetLeft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease-out',
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  )
}

export default IconButton
