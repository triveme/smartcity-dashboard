import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { InterestingPlace } from 'models/data-types'
import { BackButton, DisplayOnMapButton } from './elements/buttons'
// import parkingImage from '../assets/images/parking_image.png'
import { HeadlineGray, HeadlineYellow } from './elements/font-types'
import { CopyrightElement } from './elements/copyright-element'
import colors from 'theme/colors'
import { Stack } from '@mui/material'

type InterestingPointsDetailsProps = {
  info: InterestingPlace
  handleBackClick: () => void
  handleDisplayOnMapClick: (markerId: string, lat: number, lng: number) => void
  index: number
}

export function InterestingPointsDetails(props: InterestingPointsDetailsProps) {
  const { info, handleBackClick, handleDisplayOnMapClick, index } = props

  const markerId = `Marker-${info.location.latitude}-${info.location.longitude}-${index}`
  const lat = info.location.latitude
  const lng = info.location.longitude

  return (
    <Box height='100%' width='100%' flexBasis='33%' display='flex' flexDirection='column' padding='5px'>
      <Box
        sx={{ overflowY: 'auto', backgroundColor: colors.poiBackground }}
        display={'flex'}
        flexDirection={'column'}
        gap={'5px'}
        padding='5px'
        justifyContent={'space-between'}
      >
        {/* POI-Details */}
        <Box display={'flex'} flexDirection={'row'} padding='10px'>
          {/* Imagebox */}
          <Box
            display={'flex'}
            flexDirection={'column'}
            flexGrow={'1 1 0'}
            paddingRight={'5px'}
            flexBasis='35%'
            position={'relative'}
            maxWidth={'130px'}
          >
            <img
              src={info.image && info.image !== 'none' ? info.image : ''}
              alt={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}
              style={{ borderRadius: '5px', width: '100%', minWidth: '110px' }}
            />
            {info.creator && <CopyrightElement creator={info.creator} />}
          </Box>
          {/* Infobox */}
          <Box
            height='100%'
            display={'flex'}
            flexDirection={'column'}
            flexBasis={'65%'}
            justifyContent={'space-between'}
          >
            {/* Place info */}
            <Box
              sx={{ pl: 1 }}
              height='100%'
              display={'flex'}
              flexDirection={'column'}
              alignContent={'start'}
              alignItems={'start'}
              justifyContent={'space-around'}
            >
              <Box>
                <HeadlineYellow text={info.name} />
                <Typography variant='body2'>
                  {info.types && info.types.length > 0
                    ? info.types.map((type) => {
                        return type.toString() + ' '
                      })
                    : null}
                </Typography>
              </Box>
              <Box display={'flex'} flexDirection={'row'} alignContent={'center'} alignItems={'center'}>
                <HeadlineGray text={info.address}></HeadlineGray>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Place description */}
        <Box sx={{ py: 2, pl: 1 }}>
          <Typography variant='body2'>{info.info}</Typography>
        </Box>
        {/* Buttons */}
        <Box sx={{ px: 1 }}>
          <Stack direction={{ md: 'column', lg: 'row' }} spacing={2}>
            <BackButton onClick={handleBackClick} text={'ZURÜCK'}></BackButton>
            <DisplayOnMapButton onClick={() => handleDisplayOnMapClick(markerId, lat, lng)} text={''} />
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
