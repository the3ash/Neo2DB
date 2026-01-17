import React from 'react'

interface IconButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  icon: React.ReactNode
  variant: 'primary' | 'secondary'
  offsetLeft?: number
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, variant, offsetLeft = 0 }) => {
  return (
    <button onClick={onClick} className={`neo2db-icon-btn neo2db-icon-btn--${variant}`} style={{ left: offsetLeft }}>
      {icon}
    </button>
  )
}

export default IconButton
