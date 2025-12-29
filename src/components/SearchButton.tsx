import React, { useState } from 'react';

interface SearchButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          backgroundColor: isHovered ? '#007100' : 'green',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          padding: 0,
          border: 'none',
          position: 'absolute',
          top: '-64px',
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease-out',
          cursor: 'pointer',
        } as React.CSSProperties
      }
    >
      <svg
        width='18'
        height='18'
        viewBox='0 0 28 28'
        fill='#FFFFFF'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M21 12.5C21 17.1944 17.1944 21 12.5 21C7.80558 21 4 17.1944 4 12.5C4 7.80558 7.80558 4 12.5 4C17.1944 4 21 7.80558 21 12.5ZM19 12.5C19 16.0899 16.0899 19 12.5 19C8.91015 19 6 16.0899 6 12.5C6 8.91015 8.91015 6 12.5 6C16.0899 6 19 8.91015 19 12.5Z'
        />
        <path d='M20.7071 19.2929C20.3166 18.9024 19.6834 18.9024 19.2929 19.2929C18.9024 19.6834 18.9024 20.3166 19.2929 20.7071L22.2929 23.7071C22.6834 24.0976 23.3166 24.0976 23.7071 23.7071C24.0976 23.3166 24.0976 22.6834 23.7071 22.2929L20.7071 19.2929Z' />
      </svg>
    </button>
  );
};

export default SearchButton;
