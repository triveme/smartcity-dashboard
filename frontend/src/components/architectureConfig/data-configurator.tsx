import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import { ColorDialog } from "components/architectureConfig/color-dialog";
import { PanelComponent } from "components/panel";
import { SmallField } from "components/elements/text-fields";
import colors from "theme/colors";
import { DIALOG_TITLES } from "constants/text";
import { DateConfigRequestType, getAttributeForSource, getCollections, getSensorsForSource, getSourcesForCollection } from "clients/data-config-client";

type DataConfiguratorProps = {
  currentValueIndex?: number;
  currentTabIndex: number;
  tempPanel: PanelComponent;
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void;
};

export function DataConfigurator(props: DataConfiguratorProps) {
  const { currentValueIndex, currentTabIndex, tempPanel, setNewTabValue } =
    props;
  const currentTab = tempPanel.tabs[currentTabIndex];
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const aggrMode = currentTab && currentTab.aggrMode ? currentTab.aggrMode : "single";
  const [selectedFilter, setSelectedFilter] = useState("");

  const handleColorPickerClickOpen = (index: number) => {
    setColorIndex(index);
    setColorPickerOpen(true);
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  const handleValueAttrChange = (newAttr: string) => {
    if (currentTab.attribute) {
      let newValueKeys = cloneDeep(currentTab.attribute.keys);
      if (currentTab.attribute!.keys.length > currentValueIndex!) {
        newValueKeys[currentValueIndex!] = newAttr;
      } else {
        newValueKeys.push(newAttr);
      }
      setNewTabValue([{ key: "attributeKeys", tabValue: newValueKeys }]);
    }
  };
  
  //Autocompletion dropdown
  const [openCollection, setOpenCollection] = useState(false);
  const [optionsCollection, setOptionsCollection] = useState<readonly string[]>([]);
  const loadingCollection = openCollection && optionsCollection.length === 0;

  const [openSource, setOpenSource] = useState(false);
  const [optionsSources, setOptionsSource] = useState<readonly string[]>([]);
  const loadingSource = openSource && optionsSources.length === 0;

  const [openAttribute, setOpenAttribute] = useState(false);
  const [optionsAttributes, setOptionsAttribute] = useState<readonly string[]>([]);
  const loadingAttribute = openAttribute && optionsAttributes.length === 0;

  const [openGroupingAttribute, setOpenGroupingAttribute] = useState(false);
  const [optionsGroupingAttributes, setOptionsGroupingAttribute] = useState<readonly string[]>([]);
  const loadingGroupingAttribute = openGroupingAttribute && optionsGroupingAttributes.length === 0;
  
  const [openFilterAttribute, setOpenFilterAttribute] = useState(false);
  const [optionsFilterAttributes, setOptionsFilterAttribute] = useState<readonly string[]>([]);
  const loadingFilterAttribute = openFilterAttribute && optionsFilterAttributes.length === 0;

  const [optionsSensors, setOptionsSensors] = useState<readonly string[]>([]);


  const requestCollections = () => {
    getCollections()
    .then((collectionData) => {
      if(collectionData && collectionData !== null) {
        setOptionsCollection([...collectionData]);
        setOptionsSource([]);
        setOptionsAttribute([]);
      }
    })
  }

  const requestSources = () => {
    let collection = currentTab.fiwareService ? currentTab.fiwareService : "";
    if (collection && collection !== "") {
      getSourcesForCollection(collection)
      .then((sourcesData) => {
        if(sourcesData && sourcesData !== null) {
          setOptionsSource([...sourcesData]);
          setOptionsAttribute([]);
        }
      })
    }
  }

  const requestAttributes = () => {
    let reqArgs: DateConfigRequestType = {
      collection: currentTab.fiwareService ? currentTab.fiwareService : "",
      source: currentTab.entityId?.length === 1 ? currentTab.entityId[0] : "",
    };
    if (reqArgs.collection !== "" && reqArgs.source !== "") {
      if(currentTab.filterProperty === "keine") {
        getAttributeForSource(reqArgs)
        .then((attributesData) => {
          if (attributesData && attributesData !== null) {
            setOptionsAttribute([...attributesData]);
          }
        })
      } else {
        getSensorsForSource(reqArgs)
        .then((sensorData) => {
          if (sensorData && sensorData !== null) {
            setOptionsAttribute([...sensorData]);
            setOptionsSensors([...sensorData])
          }
        })
      }
    }
  }

  const requestGroupingAttributes = () => {
    let reqArgs: DateConfigRequestType = {
      collection: currentTab.fiwareService ? currentTab.fiwareService : "",
      source: currentTab.entityId?.length === 1 ? currentTab.entityId[0] : "",
    };
    if (reqArgs.collection !== "" && reqArgs.source !== "") {
      getAttributeForSource(reqArgs)
      .then((attributesData) => {
        if(attributesData && attributesData !== null) {
          let temp: string[] = ["keine"];
          temp = temp.concat(...attributesData);
          console.log(temp);
          setOptionsGroupingAttribute([...temp]);
          console.log("FilterAttribute");
          console.log(attributesData);
          setOptionsFilterAttribute([...attributesData]);
        }
      })
    }
  }

  useEffect(() => {
    if (!loadingCollection) {
      return undefined;
    }

    (async () => {
      await requestCollections();
    })();
  }, [loadingCollection]);

  useEffect(() => {
    if (!openCollection) {
      setOptionsCollection([]);
    }
  }, [openCollection]);

  useEffect(() => {
    if (!loadingSource) {
      return undefined;
    }

    (async () => {
      await requestSources();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSource]);

  useEffect(() => {
    if (!openSource) {
      setOptionsSource([]);
    }
  }, [openSource]);

  useEffect(() => {
    if (!loadingAttribute) {
      return undefined;
    }

    (async () => {
      await requestAttributes();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAttribute]);

  useEffect(() => {
    if (!openAttribute) {
      setOptionsAttribute([]);
    }
  }, [openAttribute]);

  useEffect(() => {
    if (!loadingGroupingAttribute) {
      return undefined;
    }

    (async () => {
      await requestGroupingAttributes();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingGroupingAttribute]);

  useEffect(() => {
    if (!openGroupingAttribute) {
      setOptionsGroupingAttribute([]);
    }
  }, [openGroupingAttribute]);

  useEffect(() => {
    if (!loadingFilterAttribute) {
      return undefined;
    }

    (async () => {
      await requestGroupingAttributes();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFilterAttribute]);

  useEffect(() => {
    if (!openFilterAttribute) {
      setOptionsFilterAttribute([]);
    }
  }, [openFilterAttribute]);

  return (
    <>
      <ColorDialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        setNewTabValue={setNewTabValue}
        currentTab={currentTab}
        attrColorIndex={colorIndex}
      />
      <Divider style={{ marginTop: "8px" }} />
      <Typography
        marginTop={1}
        marginLeft={1}
        marginBottom={1}
        sx={{ fontSize: 14 }}
        color={colors.text}
        fontWeight="bold"
      >
        {DIALOG_TITLES.DATA_CONFIG}
      </Typography>
      <Autocomplete
        options={optionsCollection}
        loading={loadingCollection}
        open={openCollection}
        onOpen={() => {
          setOpenCollection(true);
        }}
        onClose={() => {
          setOpenCollection(false);
        }}
        value={currentTab.fiwareService !== "" ? currentTab.fiwareService : null}
        isOptionEqualToValue={(option, value) => option === value}
        onChange={(e, value) => {
          setNewTabValue([{ key: "fiwareService", tabValue: value }])
          requestSources();
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            key={params.id + "-eIds-text-field"}
            size="small"
            margin="dense"
            variant="outlined"
            style={{ backgroundColor: colors.backgroundColor }}
            label="Collections"
          />
        )}
      />
      <Autocomplete
        options={optionsSources}
        loading={loadingSource}
        open={openSource}
        onOpen={() => {
          setOpenSource(true);
        }}
        onClose={() => {
          setOpenSource(false);
        }}
        // value={selectedSource !== "" ? selectedSource : null}
        value={currentTab.entityId?.length === 1 ? currentTab.entityId[0] : null}
        onChange={async (e, value) => {
          setNewTabValue([{ key: "entityId", tabValue: value }])
          // requestAttributes();
          // requestGroupingAttributes();
        }}
        isOptionEqualToValue={(option, value) => option === value}
        renderInput={(params) => (
          <TextField
            {...params}
            key={params.id + "-eIds-text-field"}
            size="small"
            margin="dense"
            variant="outlined"
            style={{ backgroundColor: colors.backgroundColor }}
            label="Source"
          />
        )}
      />
      <Box    
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
      >
        <Autocomplete
          fullWidth
          options={optionsGroupingAttributes}
          loading={loadingGroupingAttribute}
          open={openGroupingAttribute}
          onOpen={() => {
            setOpenGroupingAttribute(true);
          }}
          onClose={() => {
            setOpenGroupingAttribute(false);
          }}
          // value={selectedSource !== "" ? selectedSource : null}
          value={currentTab.filterProperty ? currentTab.filterProperty : "keine"}
          // defaultValue={"keine"}
          onChange={async (e, value) => {
            setNewTabValue([
              { key: "filterValues", tabValue: [] },
              { key: "attributeKeys", tabValue: [] },
              { key: "filterProperty", tabValue: value }
            ])
          }}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              key={params.id + "-groupingIds-text-field"}
              size="small"
              margin="dense"
              variant="outlined"
              style={{ backgroundColor: colors.backgroundColor }}
              label="Grouping Attribute"
            />
          )}
        />
        {currentTab.filterProperty !== "keine" || !currentTab.filterProperty ? (
          <Autocomplete
            fullWidth
            freeSolo
            options={optionsFilterAttributes}
            loading={loadingFilterAttribute}
            open={openFilterAttribute}
            onOpen={() => {
              setOpenFilterAttribute(true);
            }}
            onClose={() => {
              setOpenFilterAttribute(false);
            }}
            value={currentTab.filterAttribute ? currentTab.filterAttribute : ""}
            onChange={(e, v) => {
              setNewTabValue([{ key: "filterAttribute", tabValue: v }])
            }}
            // isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                key={params.id + "-filterIds-text-field"}
                size="small"
                margin="dense"
                variant="outlined"
                style={{ backgroundColor: colors.backgroundColor }}
                label="Filter Attribute"
              />
            )}
          />
        ) : null
      }
      </Box>
      {currentValueIndex === undefined || aggrMode !== "single" ? (
        <>
          {currentTab.filterProperty === "keine" ? (
            <Autocomplete
              multiple
              id="valueKeys"
              options={optionsAttributes}
              loading={loadingAttribute}
              open={openAttribute}
              onOpen={() => {
                setOpenAttribute(true);
              }}
              onClose={() => {
                setOpenAttribute(false);
              }}
              value={currentTab.attribute ? currentTab.attribute?.keys : []}
              onChange={(e, v) => {
                setNewTabValue([{ key: "attributeKeys", tabValue: v }])
              }}
              freeSolo
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  key={params.id + "-valKeys-text-field"}
                  size="small"
                  margin="dense"
                  variant="outlined"
                  style={{ backgroundColor: colors.backgroundColor }}
                  label="Multiple Attributes"
                />
              )}
            />
          ) : (
            <Autocomplete
              multiple
              id="valueKeys"
              options={optionsSensors}
              loading={loadingAttribute}
              open={openAttribute}
              onOpen={() => {
                setOpenAttribute(true);
              }}
              onClose={() => {
                setOpenAttribute(false);
              }}
              value={currentTab.filterValues ? currentTab.filterValues : []}
              onChange={(e, v) => {
                setNewTabValue([
                  { key: "filterValues", tabValue: v },
                  { key: "attributeKeys", tabValue: v }
                  // { key: "attributeKeys", tabValue: Array(v.length).fill(selectedFilter) }
                ]);
              }}
              // isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  key={params.id + "-valKeys-text-field"}
                  size="small"
                  margin="dense"
                  variant="outlined"
                  style={{ backgroundColor: colors.backgroundColor }}
                  label="Sensoren"
                />
              )}
            />
          )}
          {currentTab.attribute ? (
            <Box margin={0.5} marginTop={0}>
              {currentTab.attribute!.keys.map((key, index) => {
                let colIndex = index;
                if (
                  currentTab.apexMaxAlias &&
                  currentTab.apexMaxAlias !== "" &&
                  currentTab.apexType &&
                  currentTab.apexType === "donut"
                ) {
                  colIndex = index + 1;
                }

                return (
                  <Paper
                    key={index + "-alias-paper"}
                    style={{
                      height: "100%",
                      padding: 2,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: colors.backgroundColor,
                    }}
                    elevation={0}
                  >
                    <Chip
                      key={index + "-chip"}
                      label={key}
                      style={{ marginRight: 15, marginLeft: 10 }}
                    />
                    <SmallField
                      key={index + "-alias-text-field"}
                      label="Alias"
                      type="text"
                      value={currentTab.attribute!.aliases[colIndex]}
                      onChange={(e) =>
                        setNewTabValue([
                          {
                            key: "attributeAlias",
                            tabValue: {
                              key: currentTab.attribute!.keys[colIndex],
                              alias: e.target.value,
                            },
                          },
                        ])
                      }
                    />
                    <Button
                      size="small"
                      key={index + "-alias-color-button"}
                      variant="contained"
                      onClick={() => handleColorPickerClickOpen(colIndex)}
                      style={{
                        marginLeft: 15,
                        marginRight: 10,
                        fontWeight: "bold",
                        backgroundColor:
                          !currentTab.apexOptions ||
                          !currentTab.apexOptions!.colors ||
                          !currentTab.apexOptions!.colors![colIndex]
                            ? colors.attributeColors[0]
                            : currentTab.apexOptions!.colors![colIndex],
                      }}
                    >
                      Farbe
                    </Button>
                  </Paper>
                  // <Divider key={key + "-divider"} />
                );
              })}
            </Box>
          ) : null}
        </>
      ) : (
        <Paper
          key={currentTab.attribute?.keys[currentValueIndex] + "-alias-paper"}
          style={{
            height: "100%",
            width: "100%",
            padding: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.backgroundColor,
          }}
          elevation={0}
        >
          <Autocomplete
            options={optionsAttributes}
            loading={loadingAttribute}
            open={openAttribute}
            onOpen={() => {
              setOpenAttribute(true);
            }}
            onClose={() => {
              setOpenAttribute(false);
            }}
            value={
              currentTab.attribute &&
              currentTab.attribute?.keys[currentValueIndex]
                ? currentTab.attribute?.keys[currentValueIndex]
                : null
            }
            fullWidth
            onChange={(e, value) => {
              // handleValueAttrChange(value ? value : "");
              if (currentTab.filterAttribute && currentTab.filterAttribute !== "") {
                setNewTabValue([
                  { key: "filterValues", tabValue: [value] },
                  { key: "attributeKeys", tabValue: [value] }
                ]);
              } else {
                setNewTabValue([{ key: "attributeKeys", tabValue: [value] }]);
              }
            }}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                key={params.id + "-eIds-text-field"}
                size="small"
                margin="dense"
                variant="outlined"
                style={{ backgroundColor: colors.backgroundColor }}
                label="Single Attribute"
                fullWidth
              />
            )}
          />
          <Button
            size="small"
            key={currentTab.attribute?.keys[currentValueIndex] + "-alias-color-button"}
            variant="contained"
            onClick={() => handleColorPickerClickOpen(colorIndex)}
            style={{
              marginLeft: 15,
              marginRight: 10,
              fontWeight: "bold",
              backgroundColor:
                !currentTab.apexOptions ||
                !currentTab.apexOptions!.colors ||
                !currentTab.apexOptions!.colors![currentValueIndex]
                  ? colors.attributeColors[0]
                  : currentTab.apexOptions!.colors![currentValueIndex],
            }}
          >
            Farbe
          </Button>
        </Paper>
      )}
      <Divider style={{ marginTop: "8px", marginBottom: "8px" }} />
    </>
  );
}
