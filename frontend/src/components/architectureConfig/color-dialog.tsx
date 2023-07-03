import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { SaveButton } from 'components/elements/buttons'
import PaletteIcon from '@mui/icons-material/Palette'

import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'

import { TabComponent } from 'components/tab'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'

type ColorDialogProps = {
  open: boolean
  onClose: () => void
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
  currentTab: TabComponent
  attrColorIndex: number
}

export function ColorDialog(props: ColorDialogProps) {
  const { open, onClose, setNewTabValue, currentTab, attrColorIndex } = props

  if (!currentTab.apexOptions) {
    currentTab.apexOptions = {}
  }

  const updatedColorArray = (attrColor: string) => {
    let colArray: string[] = currentTab.apexOptions!.colors ? currentTab.apexOptions!.colors : []
    if (currentTab.apexOptions!.colors && currentTab.attribute && currentTab.attribute.keys.length > colArray.length) {
      // missing colors, fill missing values
      for (let i = 0; i < currentTab.attribute.keys.length - colArray.length; i++) {
        colArray.push(colors.attributeColors[0])
      }
    }
    colArray[attrColorIndex] = attrColor
    return colArray
  }

  return (
    <Dialog
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.backgroundColor,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogContent>
        <Box component='form' sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {colors.attributeColors.map((attrColor) => (
            <IconButton
              key={'icon-button-' + attrColor}
              onClick={() => {
                setNewTabValue([
                  {
                    key: 'apexOptions',
                    tabValue: set(cloneDeep(currentTab.apexOptions!), 'colors', updatedColorArray(attrColor)),
                  },
                ])
              }}
            >
              <PaletteIcon key={'pallete-icon-' + attrColor} style={{ color: attrColor }} />
            </IconButton>
          ))}
        </Box>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <SaveButton
          text='Schließen'
          onClick={onClose}
          customStyle={{
            fontWeight: 'bold',
            color: 'white',
            backgroundColor:
              !currentTab.apexOptions ||
              !currentTab.apexOptions.colors ||
              !(currentTab.apexOptions.colors.length > attrColorIndex)
                ? colors.primary
                : currentTab.apexOptions.colors![attrColorIndex],
          }}
        />
      </DialogActions>
    </Dialog>
  )
}

type MaxColorDialogProps = {
  open: boolean
  onClose: () => void
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
  currentTab: TabComponent
}

export function MaxColorDialog(props: MaxColorDialogProps) {
  const { open, onClose, setNewTabValue, currentTab } = props

  return (
    <Dialog
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.panelBackground,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogContent>
        <Box component='form' sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {colors.attributeColors.map((attrColor) => (
            <IconButton
              key={'icon-button-' + attrColor}
              onClick={() => {
                setNewTabValue([{ key: 'apexMaxColor', tabValue: attrColor }])
              }}
            >
              <PaletteIcon key={'pallete-icon-' + attrColor} style={{ color: attrColor }} />
            </IconButton>
          ))}
        </Box>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <SaveButton
          text='Schließen'
          onClick={onClose}
          customStyle={{
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: !currentTab.apexMaxColor ? colors.primary : currentTab.apexMaxColor,
          }}
        />
      </DialogActions>
    </Dialog>
  )
}
