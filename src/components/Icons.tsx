import React from 'react'

interface IconProps {
  size?: number
  color?: string
}

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 12.5C21 17.1944 17.1944 21 12.5 21C7.80558 21 4 17.1944 4 12.5C4 7.80558 7.80558 4 12.5 4C17.1944 4 21 7.80558 21 12.5ZM19 12.5C19 16.0899 16.0899 19 12.5 19C8.91015 19 6 16.0899 6 12.5C6 8.91015 8.91015 6 12.5 6C16.0899 6 19 8.91015 19 12.5Z"
    />
    <path d="M20.7071 19.2929C20.3166 18.9024 19.6834 18.9024 19.2929 19.2929C18.9024 19.6834 18.9024 20.3166 19.2929 20.7071L22.2929 23.7071C22.6834 24.0976 23.3166 24.0976 23.7071 23.7071C24.0976 23.3166 24.0976 22.6834 23.7071 22.2929L20.7071 19.2929Z" />
  </svg>
)

export const PlusIcon: React.FC<IconProps> = ({ size = 18, color = '#008000' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 6C15 5.44772 14.5523 5 14 5C13.4477 5 13 5.44772 13 6V13H6C5.44772 13 5 13.4477 5 14C5 14.5523 5.44772 15 6 15H13V22C13 22.5523 13.4477 23 14 23C14.5523 23 15 22.5523 15 22V15H22C22.5523 15 23 14.5523 23 14C23 13.4477 22.5523 13 22 13H15V6Z" />
  </svg>
)
