![nodejs-integration](https://github.com/triveme/smartcity-dashboard/actions/workflows/nodejs-integration.yml/badge.svg)
![nodejs-deployment](https://github.com/triveme/smartcity-dashboard/actions/workflows/nodejs-deployment.yml/badge.svg)

# Smart City Dashboard

![Overview](documentation/overview.png)

The goal of this prototypical project is to visualize data from the [FIWARE](https://www.fiware.org/)-based central Open Data Platform. By providing data, especially in the form of charts, citizens and interested parties can get an overview of the current state in the city. For example, users can see the number of visitors currently at the swimming pool or the temperature and humidity values measured by sensors in different districts of the city.

The visualization of data and its configuration can be adjusted in real-time by administrators without any additional programming efforts. Administrators can log in and use an integrated wizard to configure the desired settings. Consequently, newly injected data into the Open Data Platform can be made accessible to the public with minimal adjustments. This ensures that the data not only resides on the platform but also provides direct value to all residents.

The website primarily consists of a left-side menu and the main dashboard area on the right. Users can choose the desired dashboard from the menu, and they will be redirected to the corresponding subpage of the single-page app. The content area on the right is divided into widgets, which, in turn, contain panels. Panels are thematically organized, and on mobile devices, the menu is collapsed by default, and widgets and panels are rearranged to optimize the limited space on smaller screens.

## Contents Description

Below is a brief description of the main elements of the website, with insights into their respective configuration options.

### Panels

![Data Showing Components](documentation/data-showing-components.png)

The prototype allows creating panels in three different types:

- **Descriptive Panels:** These panels contain text and can be used, for example, to describe data.
- **Value Panels:** These panels display up to two current values. They can represent individual entity values or average, minimum, maximum, or sum values calculated from multiple entities.
- **Chart Panels:** These panels visualize information using charts generated with [APEXCHARTS](https://apexcharts.com/). Three types of charts are supported:

  - **Donut Charts:** Display values in relation to a specific maximum, making them suitable for showing occupancies or utilizations. If entities contain only one relevant attribute for display, the maximum value can be set manually.
  - **Bar Charts:** Visualize historical values using bars. The bars originate from the zero point, making them ideal for representing data with high fluctuations, such as visitor count data. While the maximum value in Donut Charts is implied in the chart, in Bar Charts, a manual maximum value can be defined independently of the data.
  - **Line Charts:** Also display historical values and function similarly to Bar Charts. The main difference is that values do not start from the zero point, making Line Charts better suited for visualizing smaller value fluctuations. For instance, they can show temperature changes of a few degrees.

The title of each panel is optional, and except for Value Panels, further subdivisions into up to three tabs can be made. This division allows, for example, displaying certain values over different time periods and providing corresponding descriptions for the data.

![Tabs](documentation/tabs.png)

### Menu

<div align="center">
  <img height="250px" src="documentation/drawer-config.png">
</div>

The collapsible menu contains all available dashboards and an information tab with links to the imprint, privacy policy, and terms of use. Administrators can edit the menu by using arrows to adjust the dashboard order, delete dashboards with a trash bin icon, or edit them with a pen icon. When editing, a popup opens, allowing adjustments to the icon, name, and URL of each dashboard. Administrators can also make dashboards invisible (like the "test" dashboard in the image) to test them before publishing.

### Wizard

All configurable components of the website can be adjusted using buttons, as described in the Menu section. Whenever administrators click the edit button or a button to create a new component, a corresponding configuration wizard opens. The most comprehensive of these is the Panel Wizard.

![Panel Wizard](documentation/panel-wizard.png)

The Panel Wizard is divided into two parts. On the right side, all configuration options available for the specific panel type are displayed. Changes made in this part are reflected in real-time on the left side of the wizard (except for changes that require communication with the backend).

The following parameters can be adjusted for panels:

- **Name:** (Panel title, optional)
- **Height:** (in pixels, min. 150) and **Width:** (in grid units, values from 2 to 12 are allowed, though choosing widths too small is discouraged to avoid visual inconsistencies)
- **Tabs:** (none, 2, or 3). If the number of tabs is greater than 1, a tab bar will appear at the bottom of the panel, allowing users to switch between tabs, and the names of the tabs can also be configured. Additionally, an input field to select the current tab will appear, and all configurations below will apply only to the current tab.
- **Type:** (either Description, Chart, or Value(s) - Note that Value(s) is only available when no tabs are chosen). The wizard adjusts based on the chosen type, and the following parameters are specific to each type.
  - *Description:*
    - **Description Text:** (Text field) allows inputting lengthy description texts that scroll within the panel if they take up too much space.
  - *Chart:*
    - **Chart Type:** (Donut, Bar, or Line)
    - **Time Range:** (last 24 hours, last 7 days, or last 30 days - shown only for historical charts - Bar and Line charts). It defines the time range from which data will be retrieved from the QuantumLeap service on the Open Data Platform.
    - **Y-Axis Label:** (Label for the Y-axis - shown only for historical charts - Bar and Line charts)
    - **X-Axis Label:** (Label for the X-axis - shown only for historical charts - Bar and Line charts)
    - **Maximum:** (Choose between "Automatic" and "Manual." When "Manual" is selected, you can provide the maximum value, an alias for the number up to the maximum, and the desired color.)
    - **Decimal Places:** (0 - 5, specifies the maximum number of decimal places in chart values)
    - *Data Binding:* The following parameters are used by the QuantumLeap service to retrieve data. Only valid inputs are allowed, meaning disallowed special characters and similar will not be accepted.
    - **FIWARE Service:** (the FIWARE service used)
    - **Entity ID:** (the ID of the entity whose attribute(s) will be visualized)
    - **Attributes:** (1 - n, the attributes whose data will be used to populate the charts). Each entered attribute must be confirmed with Enter. After confirming a valid input, another configuration option appears below the field for each attribute, allowing adjustments of the alias and color.
  - *Value(s):*
    - **Values:** (1 or 2 - for two values, an input field to select the current value will appear, similar to selecting the number of tabs).
    - **Mode:** (Current Value, Average, Sum, Minimum, or Maximum). When a mode other than "Current Value" is selected, attributes are fetched from multiple entities. This works opposite to charts (where multiple attributes can be fetched from a single entity, in Value(s) multiple entities are used to get a single attribute).
    - **Decimal Places:** (0 - 5, specifies the maximum number of decimal places in value(s))
    - *Data Binding:* The following parameters are used by the QuantumLeap service to retrieve data. Only valid inputs are allowed, meaning disallowed special characters and similar will not be accepted.
    - **FIWARE Service:** (the FIWARE service used)
    - **Entity ID(s):** (the ID(s) of the entity/entities whose attribute(s) will be visualized). Caution: When an attribute is fetched from multiple entities, the input field converts into a multi-input, and individual IDs must be confirmed with Enter!
    - **Attribute:** (the attribute from which the value(s) will be derived)
    - **Value Name:** (descriptive title for the value)

## Project Architecture

Broadly divided, the prototype consists of a frontend and a backend. The frontend visualizes the data it receives from the backend. The backend obtains data through an intelligent polling mechanism from the Open Data Platform and stores it, thus minimizing the load on the platform.

![Architecture](documentation/main-architecture.png)

- The website (frontend) is a single-page app created with [React](https://reactjs.org/).
- The corresponding backend consists of two separate [Express](https://expressjs.com/) applications that use a [MongoDB](https://www.mongodb.com/) database.
  - The Frontend Service handles all frontend-related requests.
  - The QuantumLeap Service is responsible for retrieving data from the Open Data Platform. Depending on whether it is current data (values and donut charts) or historical data (bar and line charts), it sends queries to the Context Broker (for current data) or QuantumLeap (for historical data).
  - MongoDB holds all relevant data, including user data, dashboard data, and query data.

## Functionality and Data Flow of Project Components

To illustrate the functionality of the project components, the three main data flows are described below.

![Data Flow](documentation/data-flow.png)

- **User Data Flow:** When users access a specific dashboard through a URL, the frontend sends a corresponding request to the Frontend Service. If the dashboard exists, it is retrieved from the database. As the entire dashboard's design can be adjusted by administrators in real-time, the structure is loaded at this point. However, the data retrieved from the Open Data Platform is not included in the structure. Instead, it is stored in a separate collection in the database and added to the structure through references. This allows updating the data parallel to querying it. In other words, when data is needed for a dashboard, the last available data can always be used. Only after successfully retrieving and processing the data from the Open Data Platform, the database is updated with the latest data. This ensures no delays, and users are always presented with the most current data when the page refreshes in the background.

- **Admin Data Flow:** In addition to the standard user flow, when administrators log in, the Frontend Service checks if the necessary permissions are stored in the corresponding database collection. If so, administrators receive a token that allows them to modify website content. For example, an administrator can create a panel to visualize new data from the Open Data Platform. When this change is confirmed by the administrators by saving it in the frontend, it is sent to the Frontend Service. The service stores the updated dashboard structure in the database's dashboard collection and references a new query created in the query collection. This allows the updated dashboard to be sent back to administrators, including the performed change.

- **Caching Data Flow:** As mentioned earlier, the Frontend Service and QuantumLeap Service operate separately, and the only shared interface between them is the database. A scheduler in the QuantumLeap Service regularly checks if data in the query collection of the database is empty or outdated. Only when this condition is met, it sends a query to the Open Data Platform. As a result, data for a donut chart, showing current utilization, can be updated with each cycle, while data for a historical bar chart may be updated every hour, as there is no need for high-frequency visualization of data over the last 30 days. This approach intelligently reduces the load on QuantumLeap and the QuantumLeap Service over an extended period.
