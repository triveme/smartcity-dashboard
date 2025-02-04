

## Dashboard Wizard Documentation

The `DashboardWizard` component allows users to create and configure dashboards with various settings. Below is a detailed explanation of the adjustable fields and how they interact with the backend.

### Adjustable Fields

1. **Name**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the name of the dashboard.
   - **Backend Interaction**: The name is stored in the `dashboardName` state and sent to the backend when the dashboard is saved.

2. **Font Color**
   - **Component**: `ColorPickerComponent`
   - **Description**: Allows the user to select the font color for the dashboard name.
   - **Backend Interaction**: The selected color is stored in the `dashboardFontColor` state and sent to the backend when the dashboard is saved.

3. **URL**
   - **Component**: `WizardSuffixUrlTextfield`
   - **Description**: Allows the user to set the URL for the dashboard.
   - **Backend Interaction**: The URL is stored in the `dashboardUrl` state and sent to the backend when the dashboard is saved.

4. **Visibility**
   - **Component**: `WizardDropdownSelection`
   - **Description**: Allows the user to set the visibility of the dashboard (e.g., public, private).
   - **Backend Interaction**: The selected visibility is stored in the `dashboardVisibility` state and sent to the backend when the dashboard is saved.

### Backend Interaction

- **Saving Dashboard**: When the user saves the dashboard, the component collects all the state values (`dashboardName`, `dashboardFontColor`, `dashboardUrl`, `dashboardVisibility`, etc.) and sends them to the backend using the appropriate API endpoints.
- **Widget to Panel Relation**: When a widget is selected, the component posts the widget-to-panel relation to the backend using the `postWidgetToPanelRelation` function. This function sends the widget ID, panel ID, and position to the backend.

### Example Usage

```tsx
<DashboardWizard
  dashboardName={dashboardName}
  setDashboardName={setDashboardName}
  dashboardFontColor={dashboardFontColor}
  setDashboardFontColor={setDashboardFontColor}
  dashboardUrl={dashboardUrl}
  setDashboardUrl={setDashboardUrl}
  dashboardVisibility={dashboardVisibility}
  setDashboardVisibility={setDashboardVisibility}
  errors={errors}
  iconColor={iconColor}
  borderColor={borderColor}
  backgroundColor={backgroundColor}
/>
```

### Error Handling

- **Name Error**: Displayed if the `dashboardName` is invalid or empty.
- **URL Error**: Displayed if the `dashboardUrl` is invalid or empty.
- **Visibility Error**: Displayed if the `dashboardVisibility` is invalid.

### Conclusion

The `DashboardWizard` component provides a user-friendly interface for creating and configuring dashboards. It interacts with the backend to save the dashboard settings and manage widget-to-panel relations, ensuring a seamless user experience.

___

## Panel Wizard Documentation

The `PanelWizard` component allows users to create and configure panels with various settings. Below is a detailed explanation of the adjustable fields and how they interact with the backend.

### Adjustable Fields

1. **Panel Name**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the name of the panel.
   - **Backend Interaction**: The name is stored in the `panelName` state and sent to the backend when the panel is saved.

2. **Panel Width**
   - **Component**: `WizardNumberInput`
   - **Description**: Allows the user to set the width of the panel.
   - **Backend Interaction**: The width is stored in the `panelWidth` state and sent to the backend when the panel is saved.

3. **Panel Icon**
   - **Component**: `IconSelection`
   - **Description**: Allows the user to select an icon for the panel.
   - **Backend Interaction**: The selected icon is stored in the `panelIcon` state and sent to the backend when the panel is saved.

4. **Panel Info Message**
   - **Component**: `WizardTextarea`
   - **Description**: Allows the user to set an informational message for the panel.
   - **Backend Interaction**: The info message is stored in the `panelInfoMsg` state and sent to the backend when the panel is saved.

5. **Panel Jump-off URL**
   - **Component**: `WizardUrlTextfield`
   - **Description**: Allows the user to set a URL for the panel's jump-off button.
   - **Backend Interaction**: The URL is stored in the `panelJumpoffUrl` state and sent to the backend when the panel is saved.

6. **Panel General Info**
   - **Component**: `WizardTextarea`
   - **Description**: Allows the user to set general information for the panel.
   - **Backend Interaction**: The general info is stored in the `panelGeneralInfo` state and sent to the backend when the panel is saved.

7. **Show General Info**
   - **Component**: `WizardCheckbox`
   - **Description**: Allows the user to toggle the visibility of the general information.
   - **Backend Interaction**: The visibility state is stored in the `panelShowGeneralInfo` state and sent to the backend when the panel is saved.

8. **Show Jump-off Button**
   - **Component**: `WizardCheckbox`
   - **Description**: Allows the user to toggle the visibility of the jump-off button.
   - **Backend Interaction**: The visibility state is stored in the `panelShowJumpoffButton` state and sent to the backend when the panel is saved.

9. **Open Jump-off Link in New Tab**
   - **Component**: `WizardCheckbox`
   - **Description**: Allows the user to set whether the jump-off link opens in a new tab.
   - **Backend Interaction**: The state is stored in the `panelOpenJumpoffLinkInNewTab` state and sent to the backend when the panel is saved.

10. **Jump-off Label**
    - **Component**: `WizardTextfield`
    - **Description**: Allows the user to set the label for the jump-off button.
    - **Backend Interaction**: The label is stored in the `panelJumpoffLabel` state and sent to the backend when the panel is saved.

11. **Jump-off Icon**
    - **Component**: `IconSelection`
    - **Description**: Allows the user to select an icon for the jump-off button.
    - **Backend Interaction**: The selected icon is stored in the `panelJumpoffIcon` state and sent to the backend when the panel is saved.

12. **Headline Color**
    - **Component**: `ColorPickerComponent`
    - **Description**: Allows the user to select the color for the panel headline.
    - **Backend Interaction**: The selected color is stored in the `panelHeadlinecolor` state and sent to the backend when the panel is saved.

### Backend Interaction

- **Saving Panel**: When the user saves the panel, the component collects all the state values (`panelName`, `panelWidth`, `panelIcon`, `panelInfoMsg`, `panelJumpoffUrl`, `panelGeneralInfo`, `panelShowGeneralInfo`, `panelShowJumpoffButton`, `panelOpenJumpoffLinkInNewTab`, `panelJumpoffLabel`, `panelJumpoffIcon`, `panelHeadlinecolor`, etc.) and sends them to the backend using the appropriate API endpoints.

### Example Usage

```tsx
<PanelWizard
  isCreate={isCreate}
  activePanel={activePanel}
  panels={panels}
  onClose={onClose}
  handlePanelChange={handlePanelChange}
  fontColor={fontColor}
  iconColor={iconColor}
  borderColor={borderColor}
  backgroundColor={backgroundColor}
  panelHeadlineColorProp={panelHeadlineColorProp}
/>
```

### Error Handling

- **URL Validation**: The `validateUrl` function is used to ensure that the URL provided for the jump-off button is valid.

### Conclusion

The `PanelWizard` component provides a user-friendly interface for creating and configuring panels. It interacts with the backend to save the panel settings, ensuring a seamless user experience.

___


## Widget Wizard Documentation

The `WidgetWizard` component allows users to create and configure widgets with various settings. Below is a detailed explanation of the adjustable fields and how they interact with the backend.

### Adjustable Fields

1. **Widget Name**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the name of the widget.
   - **Backend Interaction**: The name is stored in the `widgetName` state and sent to the backend when the widget is saved.

2. **Widget Description**
   - **Component**: `WizardTextarea`
   - **Description**: Allows the user to set a description for the widget.
   - **Backend Interaction**: The description is stored in the `widgetDescription` state and sent to the backend when the widget is saved.

3. **Widget Subheadline**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set a subheadline for the widget.
   - **Backend Interaction**: The subheadline is stored in the `widgetSubheadline` state and sent to the backend when the widget is saved.

4. **Widget Height**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the height of the widget.
   - **Backend Interaction**: The height is stored in the `widgetHeight` state and sent to the backend when the widget is saved.

5. **Widget Width**
   - **Component**: `WizardDropdownSelection`
   - **Description**: Allows the user to set the width of the widget.
   - **Backend Interaction**: The width is stored in the `widgetWidth` state and sent to the backend when the widget is saved.

6. **Widget Icon**
   - **Component**: `IconSelection`
   - **Description**: Allows the user to select an icon for the widget.
   - **Backend Interaction**: The selected icon is stored in the `widgetIcon` state and sent to the backend when the widget is saved.

7. **Widget Info Message**
   - **Component**: `WizardTextarea`
   - **Description**: Allows the user to set an informational message for the widget.
   - **Backend Interaction**: The info message is stored in the `widgetInfoMsg` state and sent to the backend when the widget is saved.

8. **Headline Color**
    - **Component**: `ColorPickerComponent`
    - **Description**: Allows the user to select the color for the widget headline.
    - **Backend Interaction**: The selected color is stored in the `widgetHeadlineColor` state and sent to the backend when the widget is saved.

9. **Show Widget Name**
    - **Component**: `CheckBox`
    - **Description**: Allows the user to toggle the visibility of the widget name.
    - **Backend Interaction**: The visibility state is stored in the `widgetShowName` state and sent to the backend when the widget is saved.

### Backend Interaction

- **Saving Widget**: When the user saves the widget, the component collects all the state values (`widgetName`, `widgetDescription`, `widgetSubheadline`, `widgetHeight`, `widgetWidth`, `widgetIcon`, `widgetInfoMsg`, `widgetJumpoffUrl`, `widgetShowJumpoffButton`, `widgetOpenJumpoffLinkInNewTab`, `widgetJumpoffLabel`, `widgetJumpoffIcon`, `widgetHeadlineColor`, `widgetShowName`, etc.) and sends them to the backend using the appropriate API endpoints.
  - **Update Widget**: If the widget already exists, it is updated using the `updateWidgetWithChildren` function.
  - **Create Widget**: If the widget is new, it is created using the `postWidgetWithChildren` function.
  - **Query ID**: After saving the widget, the `queryId` is retrieved from the saved widget and used to update the `reportConfig`.
  - **Update ReportConfig**: If the `reportConfig` already exists, it is updated using the `updateReportConfig` function.
  - **Create ReportConfig**: If the `reportConfig` is new, it is created using the `postReportConfig` function.

### Example Usage

```tsx
<WidgetWizard
  widgetName={widgetName}
  setWidgetName={setWidgetName}
  widgetDescription={widgetDescription}
  setWidgetDescription={setWidgetDescription}
  widgetSubheadline={widgetSubheadline}
  setWidgetSubheadline={setWidgetSubheadline}
  widgetHeight={widgetHeight}
  setWidgetHeight={setWidgetHeight}
  widgetWidth={widgetWidth}
  setWidgetWidth={setWidgetWidth}
  widgetIcon={widgetIcon}
  setWidgetIcon={setWidgetIcon}
  widgetInfoMsg={widgetInfoMsg}
  setWidgetInfoMsg={setWidgetInfoMsg}
  widgetJumpoffUrl={widgetJumpoffUrl}
  setWidgetJumpoffUrl={setWidgetJumpoffUrl}
  widgetShowJumpoffButton={widgetShowJumpoffButton}
  setWidgetShowJumpoffButton={setWidgetShowJumpoffButton}
  widgetOpenJumpoffLinkInNewTab={widgetOpenJumpoffLinkInNewTab}
  setWidgetOpenJumpoffLinkInNewTab={setWidgetOpenJumpoffLinkInNewTab}
  widgetJumpoffLabel={widgetJumpoffLabel}
  setWidgetJumpoffLabel={setWidgetJumpoffLabel}
  widgetJumpoffIcon={widgetJumpoffIcon}
  setWidgetJumpoffIcon={setWidgetJumpoffIcon}
  widgetHeadlineColor={widgetHeadlineColor}
  setWidgetHeadlineColor={setWidgetHeadlineColor}
  widgetShowName={widgetShowName}
  setWidgetShowName={setWidgetShowName}
/>
```

### Error Handling

- **Snackbar Notifications**: The `openSnackbar` function is used to display success or error messages to the user based on the outcome of the save operation.

### Conclusion

The `WidgetWizard` component provides a user-friendly interface for creating and configuring widgets. It interacts with the backend to save the widget settings and manage query and reporting configurations, ensuring a seamless user experience.

___


## Tab Wizard Documentation

The `TabWizard` component allows users to configure various settings for a tab. Below is a detailed explanation of the adjustable fields and how they interact with the backend.

### Adjustable Fields

1. **Component Type**
   - **Component**: `WizardDropdownSelection`
   - **Description**: Allows the user to select the type of component for the tab.
   - **Backend Interaction**: The selected component type is stored in the `componentType` state and sent to the backend when the tab is saved.

2. **Component Subtype**
   - **Component**: `WizardDropdownSelection`
   - **Description**: Allows the user to select the subtype of the component for the tab.
   - **Backend Interaction**: The selected component subtype is stored in the `componentSubType` state and sent to the backend when the tab is saved.

### Component Types and Subtypes


### Information Component Types and Subtypes

#### Text

- **Component**: `WizardTextfield`
- **Description**: Allows the user to set the text content.
- **Backend Interaction**: The text content is stored in the `textValue` state and sent to the backend when the tab is saved.

#### Icon with Link

- **Component**: `IconSelection`, `ColorPickerComponent`, `WizardTextfield`, `WizardUrlTextfield`
- **Description**: Allows the user to select an icon, set its color, add text, and set a URL.
- **Backend Interaction**: The selected icon, color, text, and URL are stored in the `icon`, `iconColor`, `iconText`, and `iconUrl` states and sent to the backend when the tab is saved.

#### Diagram

1. **180 Chart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the minimum and maximum values for the chart.
   - **Backend Interaction**: The values are stored in the `chartMinimum` and `chartMaximum` states and sent to the backend when the tab is saved.

2. **360 Chart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the minimum and maximum values for the chart.
   - **Backend Interaction**: The values are stored in the `chartMinimum` and `chartMaximum` states and sent to the backend when the tab is saved.

3. **Stageable Chart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the font size and tick font color for the chart.
   - **Backend Interaction**: The values are stored in the `stageableChartFontSize` and `stageableChartTicksFontColor` states and sent to the backend when the tab is saved.

4. **Piechart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the font size and color for the chart.
   - **Backend Interaction**: The values are stored in the `pieChartFontSize` and `pieChartFontColor` states and sent to the backend when the tab is saved.

5. **Linechart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the axis label size and color for the chart.
   - **Backend Interaction**: The values are stored in the `lineChartAxisLabelSize` and `lineChartAxisLabelFontColor` states and sent to the backend when the tab is saved.

6. **Barchart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the axis label size and color for the chart.
   - **Backend Interaction**: The values are stored in the `barChartAxisLabelSize` and `barChartAxisLabelFontColor` states and sent to the backend when the tab is saved.

7. **Measurement Chart**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the font size and color for the chart.
   - **Backend Interaction**: The values are stored in the `measurementChartFontSize` and `measurementChartFontColor` states and sent to the backend when the tab is saved.

#### Slider

1. **Colored Slider**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the font size and color for the slider.
   - **Backend Interaction**: The values are stored in the `coloredSliderFontSize` and `coloredSliderFontColor` states and sent to the backend when the tab is saved.

2. **Slider Overview**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the font size and color for the slider.
   - **Backend Interaction**: The values are stored in the `sliderOverviewFontSize` and `sliderOverviewFontColor` states and sent to the backend when the tab is saved.

#### Map

1. **Pin Map**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the marker color and icon for the map.
   - **Backend Interaction**: The values are stored in the `mapMarkerColor` and `mapMarkerIcon` states and sent to the backend when the tab is saved.

2. **Combined Map**
   - **Component**: `WizardTextfield`
   - **Description**: Allows the user to set the marker color and icon for the map.
   - **Backend Interaction**: The values are stored in the `mapMarkerColor` and `mapMarkerIcon` states and sent to the backend when the tab is saved.

#### Combined Component

- **Component**: `WizardTextfield`
- **Description**: Allows the user to set the font size and color for the component.
- **Backend Interaction**: The values are stored in the `combinedComponentFontSize` and `combinedComponentFontColor` states and sent to the backend when the tab is saved.

#### Value Component

- **Component**: `WizardTextfield`
- **Description**: Allows the user to set the font size and color for the component.
- **Backend Interaction**: The values are stored in the `valueComponentFontSize` and `valueComponentFontColor` states and sent to the backend when the tab is saved.

#### IFrame

- **Component**: `WizardUrlTextfield`
- **Description**: Allows the user to set the URL for the iframe.
- **Backend Interaction**: The URL is stored in the `iFrameUrl` state and sent to the backend when the tab is saved.

#### Image

- **Component**: `WizardFileUpload`
- **Description**: Allows the user to upload an image file for the tab.
- **Backend Interaction**: The uploaded image is converted to a base64 string and stored in the `imageSrc` state, which is then sent to the backend when the tab is saved.

### Backend Interaction

- **Saving Tab**: When the user saves the tab, the component collects all the state values (`componentType`, `componentSubType`, `imageSrc`, `chartMinimum`, `chartMaximum`, etc.) and sends them to the backend using the appropriate API endpoints.
  - **Update Tab**: If the tab already exists, it is updated using the `updateTab` function.
  - **Create Tab**: If the tab is new, it is created using the `postTab` function.

### Example Usage

```tsx
<TabWizard
  tab={tab}
  setTab={setTab}
  handleWidgetChange={handleWidgetChange}
  errors={errors}
  iconColor={iconColor}
  borderColor={borderColor}
  backgroundColor={backgroundColor}
  hoverColor={hoverColor}
  queryConfig={queryConfig}
  tenant={tenant}
/>
```

### Error Handling

- **Snackbar Notifications**: The `openSnackbar` function is used to display success or error messages to the user based on the outcome of the save operation.

### Conclusion

The `TabWizard` component provides a user-friendly interface for configuring tabs. It interacts with the backend to save the tab settings, ensuring a seamless user experience.





