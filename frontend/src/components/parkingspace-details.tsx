import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ParkingInfo } from 'models/data-types'
import { BackButton } from './elements/buttons'
import parkingImage from '../assets/images/parking_image.png'
import { HeadlineGray, HeadlineYellow } from './elements/font-types'

type ParkingspaceDetailsProps = {
  info: ParkingInfo
  handleBackClick: () => void
  handleShowOnMapClick: () => void
}

export function ParkingspaceDetails(props: ParkingspaceDetailsProps) {
  const { info, handleBackClick } = props

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      flexWrap={'nowrap'}
      justifyContent={'space-between'}
      alignItems={'flex-start'}
      height='100%'
    >
      <Box display={'flex'} flexDirection={'row'}>
        {/* Imagebox */}
        <Box display={'flex'} flexDirection={'column'} flexGrow={'1 1 0'} padding={'10px'}>
          <img style={{ borderRadius: '20px' }} width={'100%'} src={parkingImage} alt='Bild eines Parkhauses'></img>
        </Box>
        {/* Infobox */}
        <Box display={'flex'} flexDirection={'column'}>
          {/* Textinfo */}
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignContent={'start'}
            alignItems={'start'}
            paddingLeft={'15px'}
          >
            <Box>
              <HeadlineYellow text={info.name + ' - ' + info.type} />
              <Typography>
                {info.address?.street} {info.address?.streetnumber}
              </Typography>
              <Typography>
                {info.address?.zipcode} {info.address?.city}
              </Typography>
            </Box>
            {/* <Box>
              <HeadlineGray text='Zulässige Einfahrtshöhe'></HeadlineGray>
              <Typography>{info.maxHeight} m</Typography>
            </Box> */}
            <Box>
              <HeadlineGray text='Kapazität'></HeadlineGray>
              <Typography key={'parkingspace-details-typography-capacity-' + info.name + '-capacity'}>
                {info.capacity}
              </Typography>
            </Box>
            <Box>
              <HeadlineGray text='Öffnungszeiten' />
              {info.openingHours.map((hours, index) => (
                <Typography
                  key={'parkingspace-details-typography-openingHours-' + info.name + '-openingHours-' + index}
                >
                  {hours}
                  {index < info.openingHours.length - 1 && <br />}{' '}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Buttons */}
      <Box flex={'0 1 auto'}>
        <BackButton onClick={handleBackClick} text={'ZURÜCK'}></BackButton>
        {/* <DisplayOnMapButton onClick={handleShowOnMapClick} text={''}></DisplayOnMapButton> */}
      </Box>
    </Box>
  )
}
