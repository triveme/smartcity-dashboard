import { Box } from '@mui/material'
import { CopyrightElement } from 'components/elements/copyright-element'
import { InterestingPlace } from 'models/data-types'
import { useState } from 'react'

type ListViewImageProps = {
  info: InterestingPlace
}

export function ListViewImage(props: ListViewImageProps) {
  const { info } = props
  const [imageError, setImageError] = useState(false)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imageError) {
      setImageError(true)
    }
  }

  // use imagePreview if available, otherwise use image if available, otherwise use empty string
  const src = info.imagePreview ? info.imagePreview : info.image && info.image !== 'none' ? info.image : ''

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      flexGrow={'1 1 0'}
      paddingRight={'5px'}
      flexBasis='35%'
      minWidth={'120px'}
    >
      {!imageError ? (
        <img
          style={{ height: '100%' }}
          src={src}
          alt={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}
          onError={handleImageError}
        />
      ) : null}
      {info.creator && <CopyrightElement creator={info.creator} />}
    </Box>
  )
}
