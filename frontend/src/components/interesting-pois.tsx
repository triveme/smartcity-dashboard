import { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { MapComponent } from "./map/map";
import { HeadlineYellow, HeadlineGray } from "./elements/font-types";
import { CopyrightElement } from "./elements/copyright-element";

import { InterestingPlace } from "models/data-types";
import parkingImage from '../assets/images/parking_image.png';
import colors from "theme/colors";
import { InterestingPointsDetails } from "components/interesting-pois-details";
import { BackButton } from "./elements/buttons";
import { DashboardIcon } from "./architectureConfig/dashboard-icons";
import FilterListIcon from '@mui/icons-material/FilterList';
import theme from "theme/theme";

type InterestingPoisProps = {
  infos: InterestingPlace[]
}

const emptyPointOfInterest: InterestingPlace = {
  name: "",
  types: [],
  address: "",
  image: "",
  creator: "",
  location: {
      longitude: 7.120197671,
      latitude: 51.1951799443
  },
  info: ""
}

export function InterestingPois (props: InterestingPoisProps) {
  const { infos } = props;
  const [mapKey, setMapKey] = useState(Math.random());
  
  const [poiData, setPoiData] = useState(
    infos && infos.length > 0
      ? infos
      : [emptyPointOfInterest]
  );

  const [ pointOfInterestDetailsOpen, setPointOfInterestDetailsOpen ] = useState(false);
  const [ selectedPointOfInterest, setSelectedPointOfInterest ] = useState<InterestingPlace>(emptyPointOfInterest);
  const [ selectedPointOfInterestIndex, setSelectedPointOfInterestIndex ] = useState(-1);
  const [ marker, setMarker ] = useState(["marker",0 ,0]);

  const [ filteredInfos, setFilteredInfos ] = useState<InterestingPlace[]>(poiData);
  const [ uniqueInfoTypes, setUniqueInfoTypes ] = useState<string[]>([]);
  const [ pointOfInterestFilterOpen, setPointOfInterestFilterOpen ] = useState(false);
  const [ filteredInfosCheckbox, setFilteredInfosCheckbox ] = useState<string[]>([]);
  const [ isChecked, setIsChecked ] = useState<boolean[]>([]);
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [isListVisible, setListVisibility] = useState(true);

  useEffect(() => {
    // remove duplicates from the info-types 
    let uniqueTypes: string[] = [];
    if (poiData && poiData.length > 0) {
      poiData.forEach((info) => {
        if (info.types && info.types.length > 0) {
          info.types.forEach(type => {
            if (uniqueTypes.indexOf(type) === -1 && type !== '') uniqueTypes.push(type);
          })
        }
      })
      setUniqueInfoTypes(uniqueTypes)
      // set all checkboxes to unchecked
      setIsChecked(new Array(uniqueTypes.length).fill(false))
      //Set Schwebebahn Haltestelle to default selection
      for (let i = 0; i < uniqueTypes.length; i++) {
        if (uniqueTypes[i] === "Schwebebahn-Haltestellen") {
          handleFilterCheckboxClick(i, true, uniqueTypes[i]);
        }        
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterClick = () => {
    setPointOfInterestFilterOpen(() => !pointOfInterestFilterOpen)
  }
  const handleFilterReset = () => {
    setIsChecked(new Array(uniqueInfoTypes.length).fill(false))
    setFilteredInfosCheckbox([])
  }

  const handleFilterCheckboxClick = (index: number, checked: boolean, type: string) => {
    let typesToFilter: string[] = [...filteredInfosCheckbox]

    setIsChecked((isChecked) => isChecked.map((item, i) => i === index ? !item : item ));

    if (checked) {
      typesToFilter = [...filteredInfosCheckbox, type];
    } else {
      typesToFilter.splice(filteredInfosCheckbox.indexOf(type), 1);
    }
    setFilteredInfosCheckbox(typesToFilter);
  }

  useEffect(() => {
    // set the infos to be displayed according to the selected filters
    if (filteredInfosCheckbox.length > 0) {
      let filterList = poiData.filter(info =>
        filteredInfosCheckbox.some(type => info.types.includes(type))
      );
      //Avoid duplicates
      let uniqueInfos: InterestingPlace[] = [];
      for (let info of filterList) {
        if (!uniqueInfos.some((uniqueInfo) => uniqueInfo.name === info.name)) {
          uniqueInfos.push(info);
        }
      }
      setFilteredInfos(uniqueInfos);
    } else {
      setFilteredInfos(infos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInfosCheckbox]);

  const handlePoiClick = (pointOfInterest: InterestingPlace, index: number) => {
    setPointOfInterestDetailsOpen(true);
    setSelectedPointOfInterest(pointOfInterest);
    setSelectedPointOfInterestIndex(index);
    handleResize();
  }

  const handlePoiClose = () => {
    setPointOfInterestDetailsOpen(false);    
    setListVisibility(true);
    setSelectedPointOfInterest(emptyPointOfInterest);
    setSelectedPointOfInterestIndex(-1);
    handleResize();
  }

  const handleDisplayOnMapClick = (markerId: string, lat: number, lng: number) => {
    setListVisibility(false);
    setMarker([markerId, lat, lng])
    if (!matchesDesktop) {
      handleResize();
    }
  }

  /**
   * On mobile view a button is visible to trigger between map and list view
   * On each change a map re-render needs to happen
   */
  const handleListToggleClick = () => {
    setListVisibility(!isListVisible);
    handleResize();
  }

  /**
   * The POI Map needs to rerender to account for height/width changes
   * To achieve this, the key is changed to force a re-render
   */
  const handleResize = () => {
    setMapKey(Math.random());
  };

  const poiList = useMemo(() => {
    return(
      <Box
          display={"flex"}
          flexDirection={"column"}
          gap={"5px"}
          padding="5px"
          paddingTop={0}
        >
          {filteredInfos.map((info, index) => {
            return (
              // POI-Box
              <Box
                height="125px"
                key={"Interesting-POI-Box-" + info.name}
                display={"flex"}
                flexDirection={"row"}
                sx={{
                  backgroundColor: colors.poiBackground
                }}
                padding="10px"
              >
                {/* Imagebox */}
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  flexGrow={"1 1 0"}
                  paddingRight={"5px"}
                  flexBasis="35%"
                  width={"120px"}
                >
                  <img 
                    style={{height: "100%"}}
                    src={(info.image && info.image !== "none") ? info.image : parkingImage}
                    alt={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}>
                  </img>
                  {info.creator && <CopyrightElement  creator={info.creator}/>}
                </Box>
                {/* Infobox */}
                <Box
                  height="100%"
                  display={"flex"}
                  flexDirection={"column"}
                  flexBasis={"70%"}
                  justifyContent={"space-between"}
                >
                  {/* Textinfo */}
                  <Box
                    height="100%"
                    display={"flex"}
                    flexDirection={"column"}
                    alignContent={"start"}
                    alignItems={"start"}
                    justifyContent={"space-around"}
                  >
                    <Box>
                      <HeadlineYellow text={info.name}/>
                      <Typography variant="body2">
                        {info.types ? info.types.map((type) => {
                          return (type.toString() + " ");
                        }) : null}
                      </Typography>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      alignContent={"center"}
                      alignItems={"center"}
                    >
                      <DashboardIcon icon="IconPin" color={colors.iconColor}></DashboardIcon>
                      <HeadlineGray text={info.address}></HeadlineGray>
                    </Box>
                  </Box>
                </Box>
                {/* ArrowBox */}
                <Box
                  paddingLeft={"2px"}
                  paddingBottom={"6px"}
                  margin="auto"
                  flexBasis={"5%"}
                >
                  <IconButton
                    onClick={() => handlePoiClick(info!, index)}
                  >
                    <DashboardIcon
                      icon='IconArrowNarrowRight'
                      color={colors.grey}
                    />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
      </Box>
    );
  }, [filteredInfos]);

  return(
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection={matchesDesktop ? "row" : "column"}
      paddingBottom="8px"
    >
      <Box
        height="100%"
        width="100%"
        flexBasis={matchesDesktop ? "33%" : "5%"}
        display="flex"
        flexDirection="column"
      >
        {pointOfInterestDetailsOpen ? 
          // POI details
          <Box
            height="100%"
            width="100%"
            flexBasis="33%"
            display="flex"
            flexDirection="column"
            padding="5px"
          >
            <InterestingPointsDetails
              info={selectedPointOfInterest!}
              handleBackClick={handlePoiClose}
              handleDisplayOnMapClick={handleDisplayOnMapClick}
              index={selectedPointOfInterestIndex}
            ></InterestingPointsDetails>
          </Box>
          : 
          pointOfInterestFilterOpen ? 
          // Filter Menue
          <Box
            height="100%"
            width="100%"
            flexBasis="33%"
            display="flex"
            flexDirection="column"
            padding="5px"
          >
            <Typography 
              sx={{ 
                py: 2,
                background: colors.poiBackground
              }} display="flex" alignContent="space-between">
              <Box component="span" sx={{ flex: 1 }}>Filter</Box>
              <IconButton
                onClick={handleFilterClick}
                sx={{
                  mr: 1,
                  border: `2px solid ${colors.grey}`,
                  height: 28,
                  width: 28,
                  "&:hover": {
                    borderColor: colors.iconColor,
                  },
                  "& svg": {
                    margin: "-3px",
                  },
                  "& svg:hover": {
                    color: `${colors.iconColor} !important`,
                  }
                }}
              >
                <DashboardIcon
                  icon='IconClose'
                  color={colors.grey}
                />
              </IconButton>
            </Typography>
            <Box
              sx={{
                overflowY: "auto",
                backgroundColor: colors.poiBackground
              }}
            >
              <FormGroup>
                {uniqueInfoTypes.map((type, index) => (
                  <FormControlLabel 
                    key={type}
                    label={<Typography variant="body2">{type}</Typography>}
                    control={
                    <Checkbox
                      sx={{ color: colors.grey }}
                      size="small"
                      value={type}
                      checked={isChecked[index]}
                      name={type}
                      onChange={(e) => handleFilterCheckboxClick(index, e.target.checked, e.target.value)}
                    />}
                  />
                ))}
              </FormGroup>
            </Box>
            <Box
              sx={{ 
                py: 2,
                pr: 1,
                background: colors.poiBackground
              }} 
            >
              <Stack direction={{ md: 'column', lg: 'row' }} spacing={2}>
                <BackButton
                  onClick={handleFilterClick}
                  text={"Filter anwenden"}
                ></BackButton>
                <Button onClick={handleFilterReset}>
                  Filter Zurücksetzten
                </Button>
              </Stack>
            </Box>
          </Box>
          :
          // POI List
          <Box
            height="100%"
            width="100%"
            flexBasis="33%"
            display="flex"
            flexDirection="column"
            padding="5px"
          >
            <Box
              display="flex"
              flexDirection="row"
              width="100%"
              justifyContent={"space-between"}
            >
              <Typography>{filteredInfos.length !== infos.length ? filteredInfos.length + " / " : null} {poiData.length} Orte sortiert nach Beliebtheit</Typography>
              { !matchesDesktop ? 
                <Button size="small" onClick={handleListToggleClick} variant="outlined">
                  {isListVisible ? "Karte" : "Liste"}
                </Button> : null
              }
              {uniqueInfoTypes.length > 0 &&              
                <Button size="small" onClick={handleFilterClick} variant="outlined" startIcon={<FilterListIcon />}>
                  Filter
                </Button>
              }
            </Box>
            { isListVisible &&
              <Box
                sx={{overflowY: "scroll", mt: 1}}>
                {poiList}
              </Box>
            }
          </Box>
        }
      </Box>
      {/* Map Display */}
      <Box
        height="100%"
        width="100%"
        flexBasis={matchesDesktop ? "66%" : "95%"}
        padding="5px"
      >
        <div
          style={{
            height:"100%",
            width:"100%"
          }}
          onResize={handleResize}
        >
          <MapComponent
            key={"map-" + mapKey}
            iconType={"pois"}
            mapData={filteredInfos}
            markerToDisplay={marker}
          />
        </div>
      </Box>
    </Box>
  );
}
