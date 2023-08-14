import { useArchitectureContext } from 'context/architecture-provider'
import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'
import { IconButton, Button, Slider, Divider } from '@mui/material'

import { WidgetComponent } from 'components/widget'
import { DashboardComponent } from 'components/dashboard'
import { SmallField } from 'components/elements/text-fields'
import { SaveButton, CancelButton, DeleteButton, AddButton } from 'components/elements/buttons'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'
import { DIALOG_TITLES } from 'constants/text'
import { DashboardIcon, iconList, widgetTabIconList, WidgetTabIcons } from './dashboard-icons'

type WidgetDialogProps = {
  open: boolean
  onClose: () => void
  widget: WidgetComponent
  editMode: boolean
  parentsUids: string[]
}

export function WidgetDialog(props: WidgetDialogProps) {
  const { open, onClose, widget, editMode, parentsUids } = props
  const [parentDashboardUid] = parentsUids

  const { architectureContext, setArchitectureContext } = useArchitectureContext()

  const [newWidgetName, setNewWidgetName] = useState(editMode ? widget.name : '')
  const [newWidgetInfoHeadline, setNewWidgetInfoHeadline] = useState(editMode ? widget.infoHeadline : '')
  const [newWidgetInfoText, setNewWidgetInfoText] = useState(editMode ? widget.infoText : '')
  const [newWidgetLinks, setNewWidgetLinks] = useState<any[]>(
    widget.infoLinks && widget.infoLinks[0]
      ? widget.infoLinks
      : [{ infoLinkTitle: '', infoLinkUrl: 'https://', infoLinkDescription: '' }],
  )
  const [newWidgetWidth, setNewWidgetWidth] = useState(widget.width ? widget.width : 12)
  const [newWidgetHeight, setNewWidgetHeight] = useState(widget.height ? widget.height : 0)
  const [newWidgetIcon, setNewWidgetIcon] = useState(widget.widgetIcon)
  const [newWidgetTabIcons, setNewWidgetTabIcons] = useState(widget.tabIcons ? widget.tabIcons : [''])

  const [iconChooserOpen, setIconChooserOpen] = useState(false)
  const handleIconChooserClickOpen = () => {
    setIconChooserOpen(true)
  }
  const handleIconChooserClose = () => {
    setIconChooserOpen(false)
  }

  const [iconTabsChooserOpen, setIconTabsChooserOpen] = useState(false)
  const handleTabIconsChooserClickOpen = () => {
    setIconTabsChooserOpen(true)
  }
  const handleTabIconsChooserClose = () => {
    setIconTabsChooserOpen(false)
  }

  const handleIconClickInTabIcons = (icon: string) => {
    let temp = cloneDeep(newWidgetTabIcons)
    let index = temp.indexOf(icon)
    if (index > -1) {
      temp.splice(index, 1)
    } else {
      temp.push(icon)
    }
    temp.forEach((element, index) => {
      if (element === '') {
        temp.splice(index, 1)
      }
    })
    setNewWidgetTabIcons(temp)
  }

  const handleLinkChange = (index: number, value: string, target: string) => {
    console.log('handleLinkChange')
    const values = [...newWidgetLinks]
    // Make sure https:// is written before wwww.
    if (target === 'infoLinkUrl' && value.startsWith('www')) {
      value = 'https://' + value
    }
    values[index][target] = value
    console.dir(values)
    setNewWidgetLinks(values)
  }

  const addWidget = () => {
    if (newWidgetName.length > 0) {
      let newArchitectureContext = cloneDeep(architectureContext)
      let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
      newCurrentArchitectureContext
        .find((d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentDashboardUid)
        .widgets.push({
          _id: '',
          name: newWidgetName,
          uid: uuidv4(),
          infoHeadline: newWidgetInfoHeadline,
          infoText: newWidgetInfoText,
          infoLinks: newWidgetLinks,
          width: newWidgetWidth,
          height: newWidgetHeight,
          widgetIcon: newWidgetIcon,
          tabIcons: newWidgetTabIcons,
          panels: [],
        })
      newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
      newArchitectureContext.queryEnabled = false
      setArchitectureContext(newArchitectureContext)
    }
    setNewWidgetName('')
    onClose()
  }

  const editWidget = () => {
    if (newWidgetName.length > 0) {
      let newArchitectureContext = cloneDeep(architectureContext)
      let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
      let dashboardIndex = newCurrentArchitectureContext.findIndex(
        (d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentDashboardUid,
      )
      let widgetIndex = newCurrentArchitectureContext[dashboardIndex].widgets.findIndex((w: WidgetComponent) =>
        widget.uid ? w.uid === widget.uid : w._id === widget._id,
      )
      let wdgt: WidgetComponent = newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex]
      wdgt.name = newWidgetName
      wdgt.infoHeadline = newWidgetInfoHeadline
      wdgt.infoText = newWidgetInfoText
      wdgt.infoLinks = newWidgetLinks
      wdgt.width = newWidgetWidth
      wdgt.height = newWidgetHeight
      wdgt.widgetIcon = newWidgetIcon
      wdgt.tabIcons = newWidgetTabIcons
      newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex] = wdgt
      newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
      newArchitectureContext.queryEnabled = false
      setArchitectureContext(newArchitectureContext)
    }
    onClose()
  }

  const resettingClose = () => {
    setNewWidgetName('')
    setNewWidgetInfoText('')
    setNewWidgetInfoHeadline('')
    setNewWidgetLinks([])
    setNewWidgetWidth(12)
    setNewWidgetHeight(0)
    setNewWidgetIcon('')
    setNewWidgetTabIcons([''])
    onClose()
  }

  const softResettingClose = () => {
    let wdgt: WidgetComponent = architectureContext.currentArchitectureContext
      .find((d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentDashboardUid)
      .widgets.find((w: WidgetComponent) => (widget.uid ? w.uid === widget.uid : w._id === widget._id))
    if (wdgt) {
      setNewWidgetName(wdgt.name ? wdgt.name : '')
      setNewWidgetInfoText(wdgt.infoText ? wdgt.infoText : '')
      setNewWidgetInfoHeadline(wdgt.infoHeadline ? wdgt.infoHeadline : '')
      setNewWidgetLinks(wdgt.infoLinks ? wdgt.infoLinks : [])
      setNewWidgetWidth(wdgt.width ? wdgt.width : 12)
      setNewWidgetHeight(wdgt.height ? wdgt.height : 0)
      setNewWidgetIcon(wdgt.widgetIcon ? wdgt.widgetIcon : '')
      setNewWidgetTabIcons(wdgt.tabIcons ? wdgt.tabIcons : [''])
    } else {
      resettingClose()
      return
    }
    onClose()
  }

  const deleteLink = (index: number) => {
    const updatedLinks = [...newWidgetLinks]
    updatedLinks.splice(index, 1)
    setNewWidgetLinks(updatedLinks)
  }

  const addLink = () => {
    const newLink = {
      infoLinkTitle: '',
      infoLinkUrl: '',
      infoLinkDescription: '',
    }
    setNewWidgetLinks([...newWidgetLinks, newLink])
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.backgroundColor,
          backgroundImage: 'none',
          width: '50vw',
        },
      }}
    >
      <DialogTitle>
        {editMode ? (
          <Box display='flex' alignItems='center'>
            <EditIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.EDIT_WIDGET}
          </Box>
        ) : (
          <Box display='flex' alignItems='center'>
            <AddIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.ADD_WIDGET}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        {/* General Widget Info */}
        <Divider sx={{ mt: '5px', mb: '5px' }}>Allgemein</Divider>
        <SmallField
          label='Name'
          type='text'
          placeholder='Geben Sie den Namen des Widgets ein'
          value={newWidgetName}
          onChange={(e) => setNewWidgetName(e.target.value)}
        />
        <Box display='flex' flexDirection='row' alignItems='center' justifyContent='center' gap='10px'>
          <Box flexBasis='40%'>
            <SmallField
              label='Größe (Höhe / Breite)'
              type='number'
              placeholder='Geben Sie die Höhe des Widgets ein'
              value={newWidgetHeight}
              onChange={(e) => setNewWidgetHeight(parseInt(e.target.value) ? parseInt(e.target.value) : 0)}
            />
          </Box>
          <Box flexBasis='60%'>
            <Slider
              aria-label='Panelbreite'
              value={newWidgetWidth}
              onChange={(e, v) => setNewWidgetWidth(Number(v))}
              getAriaValueText={(v) => v.toString()}
              valueLabelDisplay='auto'
              step={1}
              marks
              min={2}
              max={12}
              style={{
                color: colors.colorDetail,
              }}
            />
          </Box>
        </Box>

        {/* Icons */}
        <Divider sx={{ mt: '5px', mb: '5px' }}>Icons</Divider>
        <Box display='flex' alignItems='center'>
          <IconButton key={'selected-widgetIcon-IconButton'} onClick={handleIconChooserClickOpen}>
            <DashboardIcon key={'selected-widget-icon'} icon={newWidgetIcon} color={colors.iconColor} />
          </IconButton>
          <Button onClick={handleIconChooserClickOpen}>Widget-Icon ändern</Button>
        </Box>
        <Box display='flex' alignItems='center'>
          <IconButton key={'selected-widgetTabIcons-IconButton'} onClick={handleTabIconsChooserClickOpen}>
            {newWidgetTabIcons.map((icon) => (
              <WidgetTabIcons key={'selected-widget-tabIcons-' + icon} icon={icon} color={colors.iconColor} />
            ))}
          </IconButton>
          <Button onClick={handleTabIconsChooserClickOpen}>Tab-Icons ändern</Button>
        </Box>

        {/* Info area */}
        {(widget.tabIcons && widget.tabIcons.includes('infoView')) || newWidgetTabIcons.includes('infoView') ? (
          <Box>
            <Divider sx={{ mt: '5px', mb: '5px' }}>Info Bereich</Divider>
            <SmallField
              label='Info Überschrift'
              type='text'
              placeholder='Geben Sie die Überschrift des Infotexts ein'
              value={newWidgetInfoHeadline}
              onChange={(e) => setNewWidgetInfoHeadline(e.target.value)}
            />
            <SmallField
              label='Infotext'
              type='text'
              placeholder='Geben Sie den Infotext des Widgets ein'
              value={newWidgetInfoText}
              onChange={(e) => setNewWidgetInfoText(e.target.value)}
              multiline={true}
            />
            {newWidgetLinks?.map((link, index) => (
              <div key={index}>
                <DeleteButton onClick={() => deleteLink(index)} />
                <SmallField
                  label='Link Titel'
                  type='text'
                  placeholder='Geben Sie die Link Titel ein'
                  value={link.infoLinkTitle}
                  onChange={(e) => handleLinkChange(index, e.target.value, 'infoLinkTitle')}
                />
                <SmallField
                  label='Link URL'
                  type='text'
                  placeholder='Geben Sie die URL des Links ein'
                  value={link.infoLinkUrl}
                  onChange={(e) => handleLinkChange(index, e.target.value, 'infoLinkUrl')}
                />
                <SmallField
                  label='Link Beschreibung'
                  type='text'
                  placeholder='Geben Sie die Beschreibung des Links ein'
                  value={link.infoLinkDescription}
                  onChange={(e) => handleLinkChange(index, e.target.value, 'infoLinkDescription')}
                />
              </div>
            ))}
            <AddButton onClick={addLink} />
          </Box>
        ) : null}

        {/* WidgetIcon Dialog */}
        <Dialog
          disableEscapeKeyDown
          open={iconChooserOpen}
          onClose={handleIconChooserClose}
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
              {iconList.map((icon) => (
                <IconButton key={'box-widgetIcon-' + icon} onClick={() => setNewWidgetIcon(icon)}>
                  <DashboardIcon
                    key={'dashboardicon-widgetIcon-' + icon}
                    icon={icon}
                    color={newWidgetIcon === icon ? colors.iconColor : colors.white}
                  />
                </IconButton>
              ))}
            </Box>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <SaveButton text='Schließen' onClick={handleIconChooserClose} />
          </DialogActions>
        </Dialog>

        {/* WidgetTabIcons Dialog*/}
        <Dialog
          disableEscapeKeyDown
          open={iconTabsChooserOpen}
          onClose={handleTabIconsChooserClose}
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
              {widgetTabIconList.map((icon) => (
                <IconButton key={'box-tabIcons-' + icon} onClick={() => handleIconClickInTabIcons(icon)}>
                  <WidgetTabIcons
                    key={'dashboardicon-tabIcons-' + icon}
                    icon={icon}
                    color={newWidgetTabIcons.indexOf(icon) > -1 ? colors.iconColor : colors.white}
                  />
                </IconButton>
              ))}
            </Box>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <SaveButton text='Schließen' onClick={handleTabIconsChooserClose} />
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <SaveButton onClick={editMode ? editWidget : addWidget} />
        <CancelButton onClick={editMode ? softResettingClose : resettingClose} />
      </DialogActions>
    </Dialog>
  )
}
