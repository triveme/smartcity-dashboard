import { useState } from 'react'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
// import ListSubheader from "@mui/material/ListSubheader";
import Select from '@mui/material/Select'
// import cloneDeep from "lodash/cloneDeep";

import { PanelComponent } from 'components/panel'
import { DataConfigurator } from 'components/architectureConfig/data-configurator'
import { SmallField } from 'components/elements/text-fields'

import colors from 'theme/colors'

type ValueConfiguratorProps = {
  currentTabIndex: number
  tempPanel: PanelComponent
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
}

export function ValueConfigurator(props: ValueConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewTabValue } = props
  const currentTab = tempPanel.tabs[currentTabIndex]

  // const [valueAmount, setValueAmount] = useState(
  //   tempPanel.tabs[currentTabIndex].attribute &&
  //     tempPanel.tabs[currentTabIndex].attribute!.keys.length > 1
  //     ? tempPanel.tabs[currentTabIndex].attribute!.keys.length
  //     : 1
  // );
  const [currentValueIndex] = useState(0)
  const [useOldType, setUseOldType] = useState('')

  // const handleValueAmountChange = (newValueAmount: number) => {
  //   if (newValueAmount === 1) {
  //     if (
  //       currentTab.attribute &&
  //       currentTab.attribute.keys.length > newValueAmount
  //     ) {
  //       let newKeys = cloneDeep(currentTab.attribute.keys);
  //       if (newKeys.length > newValueAmount) {
  //         newKeys.pop();
  //       }
  //       setNewTabValue([{ key: "attributeKeys", tabValue: newKeys }]);
  //     }
  //     setCurrentValueIndex(0);
  //   } else {
  //     if (
  //       currentTab.attribute &&
  //       currentTab.attribute.keys.length < newValueAmount
  //     ) {
  //       currentTab.attribute.keys = [currentTab.attribute.keys[0], "attribut2"];
  //       setNewTabValue([
  //         { key: "attributeKeys", tabValue: currentTab.attribute.keys },
  //       ]);
  //     }
  //   }
  //   setValueAmount(newValueAmount);
  //   currentTab.values = [];
  // };

  const handleValueNameChange = (newName: string) => {
    if (currentTab.attribute) {
      setNewTabValue([
        {
          key: 'attributeAlias',
          tabValue: {
            key: currentTab.attribute.keys[currentValueIndex],
            alias: newName,
          },
        },
      ])
    }
  }

  const handleTypeChange = (clickedType: string) => {
    setUseOldType(clickedType)
    setNewTabValue([
      {
        key: 'attributeType',
        tabValue: clickedType,
      },
    ])
  }

  return (
    <>
      <Box display='flex' alignItems='center' paddingBottom={1}>
        <FormControl variant='outlined' sx={{ minWidth: 150 }} style={{ marginTop: 9 }}>
          <InputLabel id='values-type-select-filled-label'>Typ</InputLabel>
          <Select
            size='small'
            margin='dense'
            label='Typ'
            labelId='values-tabs-type-select-filled-label'
            id='values-tabs-type-select-filled'
            value={useOldType}
            onChange={(e) => handleTypeChange(e.target.value.toString())}
            style={{ backgroundColor: colors.backgroundColor }}
          >
            {/* <MenuItem value={"old"}>Old</MenuItem> */}
            <MenuItem value={'new'}>Wert mit Einheit</MenuItem>
          </Select>
        </FormControl>
        {/* <FormControl
          variant="outlined"
          sx={{ minWidth: 150 }}
          style={{ marginTop: 9 }}
        >
          <InputLabel id="values-simple-select-filled-label">
            Werte (Anzahl / aktuell)
          </InputLabel>
          <Select
            size="small"
            margin="dense"
            label="Werte (Anzahl / aktuell)"
            labelId="values-tabs-simple-select-filled-label"
            id="values-tabs-simple-select-filled"
            value={valueAmount ? valueAmount : 1}
            onChange={(e) =>
              handleValueAmountChange(parseInt(e.target.value.toString()))
            }
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
          </Select>
        </FormControl> */}
        {/* {valueAmount > 1 && (
          <Box
            style={{
              marginLeft: 6,
              backgroundColor: colors.backgroundColor,
              width: "100%",
              borderRadius: "4px",
              border: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0, 0, 0, 0.23)",
              display: "flex",
              marginTop: "8px",
            }}
          >
            <FormControl component="fieldset" style={{ paddingLeft: 10 }}>
              <RadioGroup
                row
                aria-label="values"
                name="value-row-radio-buttons-group"
                value={
                  currentValueIndex &&
                  valueAmount &&
                  currentValueIndex < valueAmount
                    ? currentValueIndex
                    : 0
                }
                onChange={(e, v) => setCurrentValueIndex(parseInt(v))}
              >
                <FormControlLabel
                  value={0}
                  control={
                    <Radio style={{ color: colors.edit, padding: 6.5 }} />
                  }
                  label="1. Wert"
                />
                <FormControlLabel
                  value={1}
                  control={
                    <Radio style={{ color: colors.edit, padding: 6.5 }} />
                  }
                  label="2. Wert"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )} */}
      </Box>
      <FormControl
        variant='outlined'
        fullWidth
        style={{
          marginBottom: 4,
          marginTop: 4,
        }}
      >
        <InputLabel id='typ-simple-select-filled-label'>Modus</InputLabel>
        <Select
          size='small'
          margin='dense'
          variant='outlined'
          label='Modus'
          labelId='modus-simple-select-filled-label'
          id='modus-simple-select-filled'
          value={currentTab.aggrMode ? currentTab.aggrMode : 'single'}
          onChange={(e) => setNewTabValue([{ key: 'aggrMode', tabValue: e.target.value }])}
          style={{
            backgroundColor: colors.backgroundColor,
          }}
        >
          <MenuItem value='single'>Aktueller Wert</MenuItem>
          {/* <ListSubheader sx={{ backgroundColor: colors.backgroundColor }}>
            Über mehrere Entitäten
          </ListSubheader>
          <MenuItem value="avg">Durchschnitt</MenuItem>
          <MenuItem value="sum">Summe</MenuItem>
          <MenuItem value="min">Minimum</MenuItem>
          <MenuItem value="max">Maximum</MenuItem> */}
        </Select>
      </FormControl>
      <SmallField
        label='Nachkommastellen'
        type='number'
        value={!currentTab.decimals ? 0 : currentTab.decimals}
        onChange={(e) =>
          setNewTabValue([
            {
              key: 'attributeDecimals',
              tabValue: parseInt(e.target.value) ? parseInt(e.target.value) : 0,
            },
          ])
        }
        onBlur={() => {
          if (currentTab.decimals && (currentTab.decimals < 0 || currentTab.decimals > 5)) {
            setNewTabValue([{ key: 'attributeDecimals', tabValue: 0 }])
          }
        }}
      />
      <SmallField
        key={'value-name-text-field'}
        label='Name'
        type='text'
        value={currentTab.componentName}
        onChange={(e) => setNewTabValue([{ key: 'componentName', tabValue: e.target.value }])}
      />
      <SmallField
        key={'value-unit-text-field'}
        label='Einheit'
        type='text'
        value={currentTab.componentUnit}
        onChange={(e) => setNewTabValue([{ key: 'componentUnit', tabValue: e.target.value }])}
      />
      <SmallField
        key={'value-static-value-text-field'}
        label='Statischer Wert'
        type='number'
        value={currentTab.componentValue}
        onChange={(e) =>
          setNewTabValue([
            {
              key: 'componentValue',
              tabValue: e.target.value,
            },
          ])
        }
      />
      <DataConfigurator
        currentValueIndex={currentValueIndex}
        currentTabIndex={currentTabIndex}
        tempPanel={tempPanel}
        setNewTabValue={setNewTabValue}
      />
      <SmallField
        label='Wertname'
        type='text'
        value={
          currentTab.attribute && currentTab.attribute.aliases[currentValueIndex]
            ? currentTab.attribute.aliases[currentValueIndex]
            : ''
        }
        onChange={(e) => handleValueNameChange(e.target.value)}
        customStyle={{
          marginTop: 4,
        }}
      />
    </>
  )
}
