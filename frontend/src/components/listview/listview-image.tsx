import { Box } from '@mui/material'
import { CopyrightElement } from 'components/elements/copyright-element'
import { InterestingPlace } from 'models/data-types'

type ListViewImageProps = {
  info: InterestingPlace
}

export function ListViewImage(props: ListViewImageProps) {
  const { info } = props

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      flexGrow={'1 1 0'}
      paddingRight={'5px'}
      flexBasis='35%'
      width={'120px'}
    >
      <img
        style={{ height: '100%' }}
        src={info.image && info.image !== 'none' ? info.image : ''}
        alt={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}
      />
      {info.creator && <CopyrightElement creator={info.creator} />}
    </Box>
  )
}
