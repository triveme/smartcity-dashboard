import { alpha, styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

import colors from 'theme/colors'
import './smileySwitch.css'

const CustomSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: colors.colorDetail,
    '&:hover': {
      backgroundColor: alpha(colors.colorDetail, theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: colors.colorDetail,
  },
}))

export { CustomSwitch }

type SmileySwitchProps = {
  isChecked: boolean
  handleCheck: VoidFunction
}

export function SmileySwitch(props: SmileySwitchProps) {
  const { isChecked, handleCheck } = props

  return (
    <div className='checkbox-wrapper-5'>
      <div className='check'>
        <input id='check-5' type='checkbox' checked={isChecked} onChange={handleCheck}></input>
        <label htmlFor='check-5'></label>
      </div>
    </div>
  )
}
