# sample-wch-script-application

This is a sample using the "script application" feature that's part of the [Oslo]https://github.com/ibm-wch/wch-site-application) starter site. 

About the script application feature:

The script application feature lets you create a standard web page or SPA (single page application) that can be deployed as a component to WCH. Unlike other components, script applications aren't built into the WCH Angular site application. They run inside an iFrame, without requiring any modification or rebuild of the site application. Since they run in an iFrame they can be built with any JS framework. For example this sample uses Angular 1, not the Angular 5 used by the Oslo starter site.

With script applications, you can let business users configure the application component just like any other components in WCH. A content type defines the elements that are used to configure the component. In this sample there is a single Toggle element for "allowUpdate" which can be used to enable or disable the application's update support. See file {filename] for where renderingContext is referenced.

See this slide deck for more information about components for WCH, including a section on Application components: https://ibm.box.com/s/0od1ta7hsmkxzl2i8y08o06zqwa0pzbq


![Contact list demo image](doc/images/preview-image.png)

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Configure and deploy the sample script applicationn](#configure-and-deploy-the-sample-script-application)
  - [Configure your wchtools](#configure-your-wchtools)
  - [Deploy the script application](#deploy-the-script-application)
- [How to configure your own script application](#how-to-configure-your-own-script-application)
- [Accessing content item values in your script application](#accessing-content-item-values-in-your-script-application)
- [License](#license)

## Configure and deploy the sample script application

### Configure your wchtools
* Get your WCH tenant API URL. Open the Hub information dialog from the "About" flyout menu in the left navigation pane of the Watson Content Hub user interface. Copy the API URL.
* Run `wchtools init` in your command line. Enter your username and API URL when prompted to configure the wchtools cli tool

### Deploy the script application
From the command line, navigate to the content-artifacts directory of this repository and run:
* `wchtools push -Afv` this will push all the necessary files to run the script application on the site

## How to configure your own script application
Each script application will follow a certain file structure:
 * content-artifacts - root directory to contain files for this script application
   * assets - WCH web assets folder
     * dxconfig - WCH config folder
       * \<ContentTypeName\>.json - JSON config file for the script application
     * \<folder for script applicatoin\> - directory that contains the script application
   * layout-mappings - WCH layout mappings folder
     * \<content-type-name\>-layout-mapping.json - WCH layout mapping file that links the content type to the code to render the script application in the SPA
   
1. Create a new content type and take note of the name that you use. This can be done in two ways:
  * RECOMMENDED: From the UI: log in to WCH, open the side navigation. Go to Content model \> Content types \> Create content type 
  
  or:
  
  * In the content-artifacts directory for your script application, create a 'types' folder. In this folder, create a `<ContentTypeName>.json` file, using the following template as the file contents, replacing the `name` field value with your own content type name:
  ```
{
  "name": "<ContentTypeName>",
  "classification": "content-type",
  "kind": [
    "standalone"
  ],
  "description": "",
  "status": "ready",
  "tags": [],
  "elements": []
}
  ```
2. Add your script application code to the web assets folder. It is recommended to place the code within a directory that has the name of the script application.
3. In the assets/dxconfig folder, add a new JSON file with the same name as your WCH content type from step 1.
  * The JSON object will contain one property 'path', that will be the relative path from the web assets directory to the kicker index.html file for your script application. This will tell WCH what file needs to be loaded in order to run the script application: 
 
e.g.
  ```
{
  "path": "scriptApps/myScriptApp/index.html"
}
  ```
4. Configure the layout mapping file for the script application
  * The layout mapping file will link the content type to the code to render the script application.
  * The layout mapping file must follow the following template, replacing anything surrounded by `<>` with the values of the content type from step 1:
  ```
{
  "id": "<content-type-name>-layout-mapping", // form the id by replacing spaces in the content type name with dashes
  "name": "<contentTypeName>LayoutMapping", // typical layout mapping naming convention is to camelCase the content type name and append 'LayoutMapping' to it.
  "classification": "layout-mapping",
  "type": {
    "name": "<Content Type Name>" // this should match the name of your content type exactly
  },
  "mappings": [
    {
      "defaultLayout": {
        "id": "script-app-layout",
        "name": "scriptAppLayout"
      },
      "layouts": [
        {
          "id": "script-app-layout",
          "name": "scriptAppLayout"
        }
      ]
    }
  ]
}
```
5. Push the files to WCH:
  * From a command line, change directories to the newly created content-artifacts directory and run `wchtools push -Afv`

After all steps have been completed, the script application content item can be added to the your site, like any other content item. If you want to have configuration or content values that can be set by business users, add elements to the content type. All the values are available in your application as described below.

## Accessing content item values in your script application
Though script applications can be rendered without making use of the content type elements, it is easy to integrate them into your script application and enable the business user to configure the script applicaiton. HTML5 messaging is leveraged to send information to and from the script application. Inside the [wchService.js](content-artifacts/assets/scriptApps/AngularContacts/js/wchService.js) file, you can see an example of how this is done.
```
var renderingContext = {};
var parentOrigin = '*';

function updateRenderingContext(event) {
  if (event.data.message === 'updated renderingContext') {
    renderingContext = event.data.renderingContext;
    parentOrigin = event.origin
  }
}

window.addEventListener("message", updateRenderingContext, false);

function requestRenderingContext() {
  window.parent.postMessage({
    message: 'update renderingContext'
  }, parentOrigin );
}

function requestResizeFrame(newHeight) {
  window.parent.postMessage({
    message: 'resize iFrame',
    height: newHeight
  }, parentOrigin );
}

requestRenderingContext();
```

* renderingContext - a global variable that will be updated every time that a postMessage event is sent (when the renderingContext is updated) to the script applicaiton with a message of `"updated renderingContext"` 
* requestRenderingContext() - a global function that will send a postMessage to the SPA, requesting an updated renderingContext
* requestResizeFrame(newHeight) - a global function that will send a postMessage to the SPA, requesting the frame element to resize to fit the height provided by `newHeight`

If you prefer, you can import these functions into your application by copying the [wchService.js](content-artifacts/assets/scriptApps/AngularContacts/js/wchService.js) file into your script application code directory and adding
a script tag right before the `</body>` tag of the kicker html file.
e.g. `<script src="path/to/wchService.js"></script>`


Once added, you can access the renderingContext and all its properties from inside your application. The sample script application in this repository demonstrates how to make use of it in an AngularJS app.

## License
See the included license file [License](license.txt) .

[back to top](#sample-wch-script-application)
