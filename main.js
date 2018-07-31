var app = angular.module('customTable', ['tableAlmightyApp']);

app.controller('customTableCtrl', function ($scope, $http) {

    $http.get("https://api.myjson.com/bins/lmt46")
    .then(function(response) {
        $scope.tableConfig.tBody = response.data;
    });

    $scope.getCellData = function(row, property){
        if(property == "DOB"){
            return new Date(row[property]).toDateString()
        }else{
            return row[property]
        }
    }

    $scope.refresh = function(){
        $http.get("https://api.myjson.com/bins/lmt46")
        .then(function(response) {
            $scope.tableConfig.tBody = response.data;
        });           
        $scope.tableConfig.resetDirective();
    }

    $scope.removeRow = function(rowId) {
        $scope.tableConfig.tBody.every(function(tRow, index){
            if(rowId == tRow[$scope.tableConfig.trackBy] ){
                $scope.tableConfig.tBody.splice(index, 1);
                return false;
            }
            return true;
        })
    }

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

    $scope.tableConfig = {
        tHeads: [
            { property: 'firstName', text: 'First Name', customColumnClass: 'first-name'    },
            { property: 'lastName', text: 'Last Name', search : {type: 'INPUT' } },
            { 
                property: 'age', 
                text: 'Age', 
                search : {
                            type: 'SELECT', options:[
                                { text: 'Age > 50' , exp : "tRow['age'] > 50" },
                                { text: '9' , exp : "tRow['age'] == 9" },
                                { text : '24', exp : "tRow['age'] == 24"}
                            ],
                            inputType: 'Number',
                        },
                        dataAlign : 'text-right'  
            },
            { property: 'DOB', text: 'DOB', search : {type: 'INPUT' } },
        ],
        tBody:[],
        getCellData : $scope.getCellData,
        trackBy : 'id', 
        rowsPerPage:9,
        rowsPerPageOptions:[9,10,25,40],
        rowActions:[
            {toolTip : 'Delete', FAIcon: 'fa-trash', text : 'Delete ', fn:$scope.removeRow }, //FAIcon => font aweseome icon
            {toolTip : 'Open In New Tab', FAIcon: 'fa-external-link', text : 'New Tab ', fn:$scope.openNewTab}
        ],
        tableActions:[
            {
                toolTip : 'Deleted selected rows',                
                text:'Delete Selected',
                FAIcon:'fa-trash',
                fn: $scope.deleteSelected
            },
            {
                toolTip : 'Reload table data',                
                text:'Refresh',
                FAIcon:'fa-refresh',
                fn: $scope.refresh
            }
        ],
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
        selectedRowColor:'red',
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
        // customLabels:{
        //     selectedCount:'Artículos seleccionados',
        //     rowsPerPage : 'Filas por página',
        //     selectSearchDefault : 'Seleccionar'
        // },
        customClass:{
            table:'custom-tb-class',
            filterInputBox : 'custom-input-box',
            selectBox : 'custom-input-box',
            rowActionButton: 'custom-row-action-button',
            tableActionButton: 'custom-table-action-button',
            pagination:'custom-pagination'
        },
        toolSwitch:{
            filterRowEnabled : true,
            selectRowEnabled : true,
            sortingEnabled: true
        }   
    }
})