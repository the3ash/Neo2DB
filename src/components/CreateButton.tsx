import React from 'react'
import IconButton from './IconButton'
import { PlusIcon } from './Icons'

interface CreateButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const CreateButton: React.FC<CreateButtonProps> = ({ onClick }) => {
  return <IconButton onClick={onClick} icon={<PlusIcon />} variant="secondary" offsetLeft={36} />
}

export default CreateButton
