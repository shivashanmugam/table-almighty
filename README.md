# table-almighty
angularJS table directive, Scalable, extendable, configurable, Pretty Smart

# table-almighty 


## Getting Started

Simple Example
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

`tableAlmightyApp` has to injected in angular app.


**Property Description**
- `tBody` will contain the table data,
- `tHeads` contains array objects each represent header of column(th) in table 
    `{ property: 'firstName', text: 'First Name'}`
    `property` mentions which property has to be used for column
    `text` mention how the property header should display upon rendering,
- `trackBy` will have the property which is unique for each row.

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

## Search & Sort
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
            { text : '10'}
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
**rowActionObject Property Description**
- `toolTip` : shows tooltip
- `text` : Display text of the button
- `FAIcon` : font aweseome icon class suffix to display text
- `fn` : 


## Selecting rows & Performing actions

## Conditional coloring of rows & Column coloring 

## Reordering

## Custom labels 

## Custom classes

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
> Currently `angular-sortable` is not optional because loading angular modules dynamically is quite a hack, Future versions might have it.

custom column class
