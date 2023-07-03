import Button from '@mui/material/Button'

import { Box, IconButton, SvgIconProps } from '@mui/material'

type ToggleIconButtonProps = {
  onClick: () => void
  text: string
  icon: React.ReactElement<SvgIconProps>
}

export function ToggleVisibilityButton(props: ToggleIconButtonProps) {
  const { onClick, text, icon } = props

  return (
    <Box display='flex' alignItems='center'>
      <IconButton onClick={onClick}>{icon}</IconButton>
      <Button onClick={onClick}>{text}</Button>
    </Box>
  )
}
