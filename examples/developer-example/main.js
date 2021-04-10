var app = angular.module('customTable', ['tableAlmightyApp']);

app.controller('customTableCtrl', function ($scope, $http) {

    var dataUrl = 'https://gist.githubusercontent.com/shivashanmugam/90fdad5f0fea5254bf9115d840a690ca/raw/964f7a2d67f4872cff3ff0c18c023ea30485688c/table_almighty_person_data_hundred.json'
    $http.get(dataUrl)
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
        $http.get(dataUrl)
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
            { property: 'firstName', text: 'First Name', search : {type: 'INPUT' }     },
            { property: 'lastName', text: 'Last Name', search : {type: 'INPUT' } },
            { 
                property: 'age', 
                text: 'Age', 
                search : {
                            type: 'SELECT', options:[
                                { text: 'Age > 40' , exp : "tRow['age'] > 40" },
                                { text: '40 < Age < 70 ' , exp : "tRow['age'] < 70 && tRow['age'] > 40" },
                                { text: 'Age > 70' , exp : "tRow['age'] > 70" },
                                { text: '90' , exp : "tRow['age'] == 90" },
                                { text : '24', exp : "tRow['age'] == 24"}
                            ],
                        },
                        customColumnClass: 'first-name'
            },
            { property: 'DOB', text: 'DOB' },
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
                expression:"tRow['age'] > 80",
                class:'bg-silver'
            },
            {
                expression:"tRow['age'] < 30",
                class:'bg-green'
            }
        ],
        selectedRowColor:'rgb(244, 188, 66, 0.8)',
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
        customLabels:{
            selectedCount:'Items Selected',
            rowsPerPage : 'Items in page',
            selectSearchDefault : '------------------'
        },
        customClass:{
            table:'custom-tbl-class',
            filterInputBox : 'custom-input-box',
            selectBox : 'custom-select-box',
            rowActionButton: 'custom-row-action-button',
            tableActionButton: 'custom-table-action-button',
            pagination:'custom-pagination',
            tableLabel: 'custom-table-label'
        },
        toolSwitch:{
            filterRowEnabled : true,
            selectRowEnabled : true,
            sortingEnabled: true
        }   
    }
})