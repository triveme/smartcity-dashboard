import Button from '@mui/material/Button'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

import colors from 'theme/colors'

type GenericButtonProps = {
  onClick: () => void
  text?: string
  customStyle?: object
  bgColor?: string
}

type IntervalButtonProps = {
  onClick: () => void
  text: string
  active: boolean
}

type SwapButtonProps = {
  swapFunction: () => void
}

export function SaveButton(props: GenericButtonProps) {
  const { onClick, text, customStyle } = props

  return (
    <Button
      onClick={onClick}
      style={
        customStyle
          ? customStyle
          : {
              border: 0,
              backgroundColor: colors.primary,
              color: colors.white,
              fontWeight: 'bold',
            }
      }
      startIcon={<SaveIcon />}
    >
      {text ? text : 'Speichern'}
    </Button>
  )
}

export function DeleteButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.primary,
        color: colors.white,
        fontWeight: 'bold',
      }}
      startIcon={<DeleteIcon />}
    >
      {text ? text : 'Löschen'}
    </Button>
  )
}

export function CancelButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.edit,
        color: colors.white,
        fontWeight: 'bold',
      }}
      startIcon={<CancelIcon />}
    >
      {text ? text : 'Abbrechen'}
    </Button>
  )
}

export function AddButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.edit,
        color: colors.white,
        fontWeight: 'bold',
      }}
      startIcon={<AddIcon />}
    >
      {text ? text : 'Add'}
    </Button>
  )
}

export function LoginButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        border: 0,
        backgroundColor: colors.primary,
        color: colors.white,
        fontWeight: 'bold',
      }}
    >
      {text ? text : 'Login'}
    </Button>
  )
}

export function UpButton(props: SwapButtonProps) {
  const { swapFunction } = props

  return (
    <IconButton size='small' onClick={swapFunction} style={{ padding: 0, color: colors.edit }}>
      <KeyboardArrowUpIcon style={{ fontSize: '1.25rem' }} />
    </IconButton>
  )
}

export function DownButton(props: SwapButtonProps) {
  const { swapFunction } = props

  return (
    <IconButton size='small' onClick={swapFunction} style={{ padding: 0, color: colors.edit }}>
      <KeyboardArrowDownIcon style={{ fontSize: '1.25rem' }} />
    </IconButton>
  )
}

export function LeftButton(props: SwapButtonProps) {
  const { swapFunction } = props

  return (
    <IconButton size='small' onClick={swapFunction} style={{ padding: 0, color: colors.edit }}>
      <KeyboardArrowLeftIcon style={{ fontSize: '1.25rem' }} />
    </IconButton>
  )
}

export function RightButton(props: SwapButtonProps) {
  const { swapFunction } = props

  return (
    <IconButton size='small' onClick={swapFunction} style={{ padding: 0, color: colors.edit }}>
      <KeyboardArrowRightIcon style={{ fontSize: '1.25rem' }} />
    </IconButton>
  )
}

export function BackButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        fontWeight: 'bold',
        color: colors.grey,
      }}
    >
      {text ? text : 'ZURÜCK'}
    </Button>
  )
}

export function DisplayOnMapButton(props: GenericButtonProps) {
  const { onClick, text } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        fontWeight: 'bold',
        color: colors.iconColor,
      }}
    >
      {text ? text : 'AUF KARTE ANZEIGEN'}
    </Button>
  )
}

export function IntervalButton(props: IntervalButtonProps) {
  const { onClick, text, active } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        fontWeight: 'bold',
        color: active ? colors.white : colors.grey,
        backgroundColor: active ? colors.activeButtonBackground : colors.widgetBackground,
      }}
    >
      {text ? text : 'ZURÜCK'}
    </Button>
  )
}

export function FilterButton(props: GenericButtonProps) {
  const { onClick } = props

  return (
    <Button
      variant='outlined'
      onClick={onClick}
      style={{
        fontWeight: 'bold',
        color: colors.grey,
        backgroundColor: colors.widgetBackground,
      }}
    >
      FILTER
    </Button>
  )
}
