import Box from '@mui/material/Box'

import smartCityLogo from 'assets/logos/logo_wuppertal.svg'
// import smartCityLogo from "assets/smartCityLogo.svg";

export function MenuIcon() {
  return (
    <Box sx={{ flexGrow: 1, marginTop: '0px', marginBottom: '2px' }}>
      <img height='42px' src={smartCityLogo} alt='logo smart city' />
    </Box>
  )
}
