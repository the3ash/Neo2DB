import React from 'react'
import IconButton from './IconButton'
import { SearchIcon } from './Icons'

interface SearchButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return <IconButton onClick={onClick} icon={<SearchIcon />} variant="primary" offsetLeft={0} />
}

export default SearchButton
