import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

import colors from 'theme/colors'
import smartCityLogo from 'assets/logo_eichenzell.svg'
// import smartCityLogo from 'assets/smartCityLogo.svg'

const drawerWidth = 240

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  background: colors.menuBarBackground,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

interface AppBarComponentProps {
  open: boolean
  handleDrawerToggle: () => void
}

const AppBarComponent = (props: AppBarComponentProps) => {
  const { open, handleDrawerToggle } = props
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <AppBar position='fixed' open={open && matchesDesktop} theme={theme}>
      <Toolbar>
        <IconButton
          color='inherit'
          aria-label='open drawer'
          onClick={handleDrawerToggle}
          edge='start'
          sx={{
            marginRight: '36px',
            ...(open && matchesDesktop && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, marginTop: '0px', marginBottom: '2px' }}>
          <img height='42px' src={smartCityLogo} alt='logo smart city' />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export { AppBar, AppBarComponent, DrawerHeader }
