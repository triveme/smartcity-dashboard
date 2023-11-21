import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

type MenuButtonProps = {
  open: boolean
  toggleDrawer: () => void
  matchesDesktop: boolean
}

export function MenuButton(props: MenuButtonProps) {
  const { open, toggleDrawer, matchesDesktop } = props

  return (
    <IconButton
      color='inherit'
      aria-label='open drawer'
      onClick={toggleDrawer}
      edge='start'
      sx={{
        marginRight: '36px',
        ...(open && matchesDesktop && { display: 'none' }),
      }}
    >
      <MenuIcon />
    </IconButton>
  )
}
