import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import { DrawerProps } from '@mui/material/Drawer'

import colors from 'theme/colors'

export function InformationMenuBox(props: DrawerProps) {
  const { open } = props

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
      <Link
        to='/information'
        style={{
          color: colors.inputFieldOutline,
          fontSize: 12,
        }}
      >
        <Box display='flex' justifyContent={'center'}>
          {open ? 'Informationen' : 'Info'}
        </Box>
      </Link>
      <Link
        to='/impressum'
        style={{
          color: colors.inputFieldOutline,
          fontSize: 12,
        }}
      >
        <Box display='flex' justifyContent={'center'}>
          Impressum
        </Box>
      </Link>
      <Link
        to='/datenschutzerklaerung'
        style={{
          color: colors.inputFieldOutline,
          fontSize: 12,
        }}
      >
        <Box display='flex' justifyContent={'center'}>
          {open ? 'Datenschutzerklärung' : 'Datenschutz'}
        </Box>
      </Link>
    </Box>
  )
}
