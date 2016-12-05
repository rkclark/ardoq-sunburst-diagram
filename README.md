d3 Sunburst Visualisation Plugin for Ardoq
======

Generates an interactive d3 Sunburst visualisation displaying any hierarchy of components/workspaces in [Ardoq](https://ardoq.com/).

![Example sunburst visualisation](https://github.com/rkclark/ardoq-sunburst-diagram/blob/master/sunburst_example.PNG)

## Usage

Set your context to a workspace root to have the visualisation render all currently open workspaces.

*or*

Set your context to a specific component to have the visualisation render only your selected component and its children.

## Features

- Click any component on the model to smoothly re-focus the visualisation with your selection at its centre. Click the centre of the diagram to zoom back out one level.
- Components inherit the correct colours they have been assigned in your model, with the visualisation making them a slightly lighter shade the further down the hierarchy they belong.
- A tooltip showing the component name is shown on mouseover, if you wish the tooltips to remain once displayed, click the "Toggle sticky tooltips" button in the top left.

## Installation

- Open the Ardoq plugin editor *(Refer to Ardoq help documentation for guidance if needed)*
- Click to create a new Plugin
- Give the plugin an ID and name. The name will be shown in the visualisation list.
- Copy and paste the code from sunburst.js into the code editor window, over-writing any existing code that may be there.
- Click to Save and Run the plugin. It will now be a selectable visualisation in your model!

---

*I hope you enjoy using the visualisation! Changes to the core Ardoq application may affect the plugin in the future, feel free to open any issue on this repo if you have any problems :)*

*Plugin working correctly as at Ardoq version Version: 3.4.60 / 1.39.16.*
