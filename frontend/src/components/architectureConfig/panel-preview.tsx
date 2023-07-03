import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Panel, PanelComponent } from 'components/panel'

import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'

type PanelPreviewProps = {
  parents: string[]
  parentsUids: string[]
  panelToPreview: PanelComponent
}

export function PanelPreview(props: PanelPreviewProps) {
  const { parents, parentsUids, panelToPreview } = props

  return (
    <Paper
      style={{
        height: '100%',
        padding: 10,
        backgroundColor: colors.widgetBackground,
        borderRadius: borderRadius.componentRadius,
      }}
      elevation={0}
    >
      <Grid container spacing={2}>
        <Panel editMode={false} parents={parents} parentsUids={parentsUids} previewMode panel={panelToPreview} />
      </Grid>
    </Paper>
  )
}
