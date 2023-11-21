import * as React from 'react'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import CloseIcon from '@mui/icons-material/Close'

import colors from 'theme/colors'
import { useAuth } from 'react-oidc-context'

type TransitionAlertProps = {
  alertText: String
  info?: Boolean
}

export function TransitionAlert(props: TransitionAlertProps) {
  const { alertText, info } = props
  const [open, setOpen] = React.useState(true)
  const auth = useAuth()

  const infoText: String = 'Daten werden geladen.'

  return (
    <Collapse
      in={open}
      sx={{
        zIndex: 1,
        width: '80%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%)`,
      }}
    >
      <Alert
        className='alert'
        severity={info ? 'info' : 'warning'}
        variant='outlined'
        action={
          <IconButton
            aria-label='close'
            color='inherit'
            size='small'
            onClick={() => {
              setOpen(false)
            }}
          >
            <CloseIcon fontSize='inherit' />
          </IconButton>
        }
        sx={{
          mb: 2,
          backgroundColor: colors.panelBackground,
        }}
      >
        {info ? infoText : auth.isAuthenticated ? alertText : 'Es konnten keine Daten geladen werden'}
      </Alert>
    </Collapse>
  )
}
