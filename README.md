# table-almighty 

## Table of Content
1. [Getting Started](#getting-started)
    - [Simple Example](#simple-example)
    - [Process data before rendering](#process-data-before-rendering)
2. [Search & Sort](#search-and-sort)
    - [Search](#search)
    - [Sort](#sort)
3. [Actions for every row](#actions-for-every-row)
4. [Selecting rows and Performing actions](#selecting-rows-and-performing-actions)
    - [Refresh directive Resetting Directive values](#refresh-directive-resetting-directive-values)
5. [Conditional coloring of rows and Column coloring](#conditional-coloring-of-rows-and-column-coloring)
6. [Reordering](#reordering)
7. [Custom labels](#custom-labels)
8. [Custom classes](#custom-classes)
9. [Dependencies](#dependencies)

## Getting Started

### Simple Example
```htmlmixed=
<body ng-app="getStarted" ng-controller="getStartedCtrl" class="container">
    <table-almighty config="tableConfig"></table-almighty>
</body>
```

```javascript=
var app = angular.module('getStarted', ['tableAlmightyApp']);

app.controller('getStartedCtrl', function ($scope, $http) {

    $scope.tableConfig = {
        tHeads: [
            { property: 'firstName', text: 'First Name'},
            { property: 'lastName', text: 'Last Name'},
            { property: 'age', text: 'Age' },
            { property: 'DOB', text: 'DOB'},
        ],
        tBody:[
            {
                "id": 1,
                "firstName": "Graiden",
                "lastName": "Mccray",
                "age": 90,
                "DOB": "2017-11-29T12:48:01-08:00"
            },
            {
                "id": 2,
                "firstName": "Otto",
                "lastName": "Hall",
                "age": 36,
                "DOB": "2017-07-26T16:54:13-07:00"
            }
        ],
        trackBy : 'id'
    }  
})
```

- `tableAlmightyApp` has to injected in angular app.
- `tableConfig` used as specification object to generate table, It is the only variable two-way binded with `table-almighty` directive,
**Property Description**
- `tBody` will contain the table data,
- `tHeads` contains array objects each represent header of column(th) in table 
    `{ property: 'firstName', text: 'First Name'}`
    `property` mentions which property has to be used for column
    `text` mention how the property header should display upon rendering,
- `trackBy` will have the property which is unique for each row.

### Process data before rendering
Incase if the column details need to be processed before rendering  in the table, For example DOB property is in UTC format(`2017-11-29T12:48:01-08:00`), But want to display in more readable format (`Sun May 28 2017`) tableConfig provides function to process tBody values before rendering.
```javascript=

$scope.getCellData = function(row, property){
    if(property == "DOB"){
        return new Date(row[property]).toDateString()
    }else{
        return row[property]
    }
}
$scope.tableConfig = {
    ...
    ...
    tHeads: [
        {...},
        {...}
    ]
    tBody:[ 
        {...},
        {...}
    ],
    trackBy : 'id',
    getCellData : $scope.getCellData,
    ...
    ...
}
```

Other use cases are instead of showing full name of the person instead of show first name and lastname.

## Rows per page &  Pagination
```javascript=
$scope.tableConfig = {
    ...
    ...
    rowsPerPage:9,
    ...
    ...
}
```
**Property Description**
- `rowsPerPage` onced added will add pagination and restricts the number of rows per page based on the value given.
- 
```javascript=
$scope.tableConfig = {
    ...
    ...
    rowsPerPage:9,
    rowsPerPageOptions:[9,10,25,40],
    ...
    ...
}
```
**Property Description**
- `rowsPerPageOptions` once added will have and option to change the number of rows per page show.
> Note
> `rowsPerPageOptions` will not work if `rowsPerPage` is not provided

## Search and Sort

### Search
```javascript=
$scope.tableConfig = {
    tHeads: [
        { property: 'firstName', text: 'First Name', search : {type: 'INPUT' }},
        { property: ...
        ...
        ...
    ]
    ...
    ...
    toolSwitch:{
        filterRowEnabled : true
    }
    ...
    ...
}
```
**Property Description**
- `toolSwitch` act as a switch for certain features, Need to be enabled for search filter
-`search` Object which is inside tHead adds search box for the column where it resides

**`search` Object properties and usage** 

- Type: 
    `INPUT` - String search 
    `SELECT` - Selectable Search
- InputType 
    `Number` - Matches exactly the number, If not mentioned filters (9, 9*, 9**, *9**, etc)

    __Example__
    ```javascript=
    search : {
        type: 'SELECT', options:[
            { text: 'Age > 50' , exp : "tRow['age'] > 50" },
            { text: '9' , exp : "tRow['age'] == 9" },
            { text : '24', exp : "tRow['age'] == 24"}
        ],
        inputType: 'Number',
    },
    ```
    - Adds a select box filter on top `Age` column and adds options three options `[Age > 50, 9, 10]`
    - `options` Array takes Object as input which has `text` and `exp`
    
        - `text` how option should appear
        - `exp` how the option should be evaluted against property. `tRow[<property_name>]` gives access to row property
            
### Sort
```javascript=
$scope.tableConfig = {
    ...
    ...
    toolSwitch:{
        sortingEnabled: true
    }
    ...
    ...
}
```
Adding `sortingEnabled` proptery inside `toolSwitch` enables sorting for all the headers.
Also distinguishes sorting Type (Number, String, Date) through the property types.
    
## Actions for every row
```javascript=
$scope.removeRow = function(rowId){
    $scope.tableConfig.tBody.every(function(tRow, index){
        if(rowId == tRow[$scope.tableConfig.trackBy] ){
            $scope.tableConfig.tBody.splice(index, 1);
            return false;
        }
        return true;
    })
}

$scope.tableConfig = {
    ...
    ...
    rowActions:[
            {toolTip : 'Delete', FAIcon: 'fa-trash', text : 'Delete ', fn:$scope.removeRow}, //FAIcon => font aweseome icon
            {toolTip : 'Open In New Tab', FAIcon: 'fa-external-link', text : 'New Tab ', fn:$scope.openNewTab}
        ],
    ...
    ...
}
```
**rowAction Object Property Description**
- `toolTip` : shows tooltip
- `text` : Display text of the button
- `FAIcon` : font aweseome icon class suffix to display text
- `fn` : function to execute upon clicking(row unique id Will be sent as first argument for the function)
    - Sample `removeRow` function
     ```javascript
     $scope.removeRow = function(rowId) {
        $scope.tableConfig.tBody.every(function(tRow, index){
            if(rowId == tRow[$scope.tableConfig.trackBy] ){
                $scope.tableConfig.tBody.splice(index, 1);
                return false;
            }
            return true;
        })
    }
     ```
## Selecting rows and Performing actions

```javascript=
$scope.tableConfig = {
    
    ...
    ...
    tableActions:[
        {
            toolTip : 'Deleted selected rows',
            text:'Delete Selected',
            FAIcon:'fa-trash',
            fn: $scope.deleteSelected
        }
    ]
    ...
    ...
    toolSwitch:{
            ...
            selectRowEnabled : true,
            ...
    }
}
```

> Need to enable `selectRowEnabled` in `toolSwitch`.

**tableActions Object Property Description**
- `toolTip` : shows tooltip
- `text` : Display text of the button
- `FAIcon` : font aweseome icon class suffix to display text
- `fn` : function to execute upon clicking(The selected rows will sent as a first arugment to the function)
    - Sample `deleteSelected` function 
    ```javascript
        $scope.deleteSelected = function(){
        var seletedRows = $scope.tableConfig.getSelectedRows();
        seletedRows.forEach(function(tRowSelected){
            $scope.tableConfig.tBody.forEach(function(tRow, tRowIndex){
                if(tRow[$scope.tableConfig.trackBy] == tRowSelected[$scope.tableConfig.trackBy] ){
                    $scope.tableConfig.tBody.splice(tRowIndex, 1);
                }
            })
        })
    }
    ```
    
In the code `$scope.tableConfig.getSelectedRows();` returns the selected rows. `getSelectedRows` function have added as the `tableConfig` is binded to the directive.

### Refresh directive (Resetting Directive values)
Incase want's to refresh table data , just need to update `tableConfig.tBody` with new table data and need to call `$scope.tableConfig.resetDirective` function to reset search, sort, pagination, selected rows 
```javascript=
$scope.refresh = function(){
        $http.get("https://api.myjson.com/bins/lmt46")
        .then(function(response) {
            $scope.tableConfig.tBody = response.data;
        });           
        $scope.tableConfig.resetDirective(); // function attached as part of tableConfig upon directive linking
    }
```

You can also have this function as a `tableActions` Object.


## Conditional coloring of rows and Column coloring 

```javascript=
$scope.tableConfig = {
    ...
    ...
    rowColorScheme: [
        {
            expression:"tRow['age'] > 50",
            class:'bg-silver'
        },
        {
            expression:"tRow['age'] < 30",
            class:'bg-green'
        }
    ],
    ...
    ...
}
```
- `rowColorScheme` is an Object Array

**rowColorScheme Object Property Description**
- `expression` tRow['age'] > 50
    - `tRow` gives access to particular row of the Table, `age` refers which property of the row must be applied for the greater than 50 (`tRow['age'] > 50`)  constrain.
- `class` The custom class which will be applied when the `expression` is true.
## Reordering
```javascript=
$scope.tableConfig = {
    ...
    ...
    sortableOptions: {
            disabled: false,
            //this helper function makes sure not to shrink the td in tr while dragging
            helper: function (e, ui) {
                ui.children().each(function () {
                    $(this).width($(this).width());
                });
                return ui;
            }
        },
    ...
    ...
    toolSwitch:{
            ...
            ...
            sortingEnabled: true
    }   
}
```
Currently adding the `sortableOptions` and `toolSwitch.sortingEnabled` value true enables reordering.
> `sortableOptions` Object will be removed in further versions, `toolSwitch.sortingEnabled` will be the primary. (currently its a bit ugly due technical difficulty faced).

> Note : Re-ordering only helpful when not using pagination, filter, sorting, After re-ordering you can get the re-ordered data from table config's tBody (`tableConfig.tBody`)



## Custom labels 
```javascript=
$scope.tableConfig = {
    ...
    ...
     customLabels:{
            selectedCount:'Artículos seleccionados',
            rowsPerPage : 'Filas por página',
            selectSearchDefault : 'Seleccionar'
        },
    ...
    ...
}
```
By default the table has some default english text for table action labels, In case the users are spanish you can use `customLabels` to override the default text.
## Custom classes
```javascript=
$scope.tableConfig = {
    ...
    ...
     customClass:{
            table:'custom-tb-class',
            filterInputBox : 'custom-input-box',
            selectBox : 'custom-input-box',
            rowActionButton: 'custom-row-action-button',
            tableActionButton: 'custom-table-action-button',
            pagination:'custom-pagination'
        },
    ...
    ...
}
```
Currently the directive uses bootstrap, To override that and to use custom class for different components use `customClass` Object in table config.

## Dependencies
**Optional Libraries**
- `jquery`
- `jquery-ui`
- `bootstrap`
- `font-awesome`


You can also update the config `tBody` after a `http` response
```javascript=
$http.get("https://api.myjson.com/bins/lmt46")
    .then(function(response) {
        $scope.tableConfig.tBody = response.data;
    });
```

> **Note** 
> Currently `angular-sortable` is not optional because loading angular modules dynamically is quite a hack, Future versions might have it. (angular sortable will trigger if jquery and jquery-ui is not loaded, But that does't cause any effects in table-almighty direcive ),
