var app = angular.module('customTable', ['ui.sortable']);

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

    $scope.removeRow = function(rowId){
        $scope.tableConfig.tBody.every(function(tRow, index){
            console.log(rowId + '---' + tRow[$scope.tableConfig.trackBy])
            if(rowId == tRow[$scope.tableConfig.trackBy] ){
                $scope.tableConfig.tBody.splice(index, 1);
                return false;
            }
            return true;
        })
        $scope.tableConfig._tBodyClone.every(function(tRowClone, index){
            console.log(rowId + '---' + tRowClone[$scope.tableConfig.trackBy])
            if(rowId == tRowClone[$scope.tableConfig.trackBy] ){
                $scope.tableConfig._tBodyClone.splice(index, 1);
                return false;
            }
            return true;
        })
    }

    $scope.deleteSelected = function(){
        $scope.tableConfig.selectedRows.forEach(function(tRowSelected){
            $scope.tableConfig.tBody.forEach(function(tRow, tRowIndex){
                if(tRow[$scope.tableConfig.trackBy] == tRowSelected[$scope.tableConfig.trackBy] ){
                    $scope.tableConfig.tBody.splice(tRowIndex, 1);
                }
            })
        })
    }


    $scope.refresh = function(){
        refreshInternalHook()
        $http.get("https://api.myjson.com/bins/lmt46")
        .then(function(response) {
            $scope.tableConfig.tBody = response.data;
        });           
    }

    function refreshInternalHook(){
        $scope.tableConfig._tBodyClone = [];
        $scope.tableConfig._selectAll = false;
        $scope.tableConfig.tHeads.forEach(function(tHead){
            tHead.search._input = '';
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
                                { text : '10'}
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
            {toolTip : 'Delete', FAIcon: 'fa-trash', text : 'Delete ', fn:$scope.removeRow}, //FAIcon => font aweseome icon
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
        mainInputSearchProperties:['lastName', 'age'],
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
        selectedRows : [], 
        selectedRowColor:'red',
        sortableOptions: {
            //this helper function makes sure not to shrink the td in tr while dragging
            helper: function (e, ui) {
                ui.children().each(function () {
                    $(this).width($(this).width());
                });
                return ui;
            }
        },
        // customLabels:{
        //     selectedCount:'Selected Items',
        //     rowsPerPage : 'Rows Per Page',
        //     selectSearchDefault : 'Select'
        // },
        customClass:{
            table:'custom-tb-class',
            filterInputBox : 'custom-input-box',
            mainInputBox:'form-control input-sm',
            selectBox : 'custom-input-box',
            rowActionButton: 'custom-row-action-button',
            tableActionButton: 'custom-table-action-button'  
        },
        toolSwitch:{
            filterRowEnabled : true,
            selectRowEnabled : true,
            sortingEnabled: true
        }
        
    }

    
})

app.directive('cTable', ['$filter','$compile', function ($filter, $compile){
    return {
        templateUrl:'c-table.html',
        scope: {
            config: '=' 
        },
        link: function($scope,$elem,$attr){ 
            //if there is not trackBy add a custom one

            //this init will be executed whenever the refresh has been hit, Will be invoked through internalRefreshHook
            $scope.init = function(){

                //creating the clone of the original data [ Because filter, search not just hide the unmatched also removes from binded value, so need to keep the original ] 
                $scope.config._tBodyClone = angular.copy($scope.config.tBody);

                //controller variables for check box under each rows
                
                //mentions the count, Should be replaced by config.selectedrows.length
                $scope.config._selectAll = false;

                $scope.config._currentPage = 1; //What are the variabe
                $scope._pageRange = [];

                $scope._sortHead = '';//currently sorted
                $scope._sortReverse = false;

                if($scope.config._tBodyClone){
                    $scope.config._tBodyClone.forEach(function(tRow) {
                        tRow._selected = false;
                    })            
                }

                $scope.$watch('[config.tBody, config.tBody.length]', function(newV, oldV){
                    $scope.search();
                    _numberOfPages();
                })

                if($scope.config.mainInputSearchProperties){
                    $scope.config._mainInputSearch = ""
                }
            }

    
            $scope.init();

            //Place for dynamically creating css classes based on config
            if($scope.config.selectedRowColor){
                //class for selected Row Color
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '.selected-row-color { background-color: ' + $scope.config.selectedRowColor +  '}';
                document.getElementsByTagName('head')[0].appendChild(style);
            }

            //handles select all and individual row select 
            $scope.selectRow = function(type, isSelected){
                if(type == 'selectAll'){
                    $scope.config._tBodyClone.forEach(function(tRow) {
                        tRow._selected = $scope.config._selectAll;
                    })            
                }else{
                    if(!isSelected) $scope._selectAll = false;
                }
                _updateSelectedRows();
            }

            //handles sort click on the table header
            $scope.sort = function (header) {
                if($scope.config.toolSwitch.sortingEnabled){
                    $scope._sortReverse = (header.property == $scope._sortHead) ? !$scope._sortReverse : false;
                    $scope._sortHead = header.property;
                }
            }       

            //handles all the events of filter row
            $scope.search = function(searchType){
                //pagination comes back to first Back,[ Otherwise its a chaos]
                $scope.config._currentPage = 1;
                
                //during the search the tBodyCloned get's original data value, Because each search is not considered as chain of events, It's is individual search based on multiple parameters of original data
                var tBodyTemp = angular.copy($scope.config.tBody) 
                tBodyTemp.forEach(function(tRow) {
                    $scope.config._tBodyClone.forEach(function(tRowClone) {
                        if(tRow[$scope.config.trackBy] == tRowClone[$scope.config.trackBy]){
                            angular.extend(tRow, tRowClone); //this extend will make sure the internal variables (_selected) also gets considered while creating new tBodyClone
                        }
                    })
                })
                $scope.config._tBodyClone = tBodyTemp;

                if(searchType ="filterSearch"){
                    $scope.config.tHeads.forEach(function(tHead) {
                        if(tHead.search){
                            if(tHead.search._input){

                                if(tHead.search.inputType == Number){
                                    if(tHead.search._input.exp != undefined){
                                        $scope.config._tBodyClone = $filter('evalExp')($scope.config._tBodyClone, tHead.search._input.exp);    
                                    }else{

                                    }
                                }else{
                                    //if the input is expression then filtering using eval Exp search directory
                                    if(tHead.search._input.exp != undefined){ 
                                        $scope.config._tBodyClone = $filter('evalExp')($scope.config._tBodyClone, tHead.search._input.exp);    
                                    }else{
                                        $scope.config._tBodyClone = $filter('search')($scope.config._tBodyClone, tHead.search._input.toString(), [tHead.property] );
                                    }
                                }
                            }
                        } 
                    });
                }else if(searchType == "mainInputBox"){
                    
                }
                
                //after a filter have to make sure the selected rows count gets updated
                _updateSelectedRows();
                
            }

            function _updateSelectedRows(){
                var selectedRowcount = 0;
                $scope.config.selectedRows = [];
                $scope.config._tBodyClone.forEach(function(tRowClone) {
                    $scope.config.tBody.forEach(function(tRow) {
                        if(tRowClone[$scope.config.trackBy] == tRow[$scope.config.trackBy]){
                            if(tRowClone._selected){
                                selectedRowcount++;
                                $scope.config.selectedRows.push(tRow);
                            } 
                        }
                    })
                })            
            }

            function _numberOfPages(){
                $scope._pageRange = [];
                for(var i = 1;i <= ($scope.config._tBodyClone.length / $scope.config.rowsPerPage);i++){
                    $scope._pageRange.push(i);
                }
                if($scope.config._tBodyClone.length % $scope.config.rowsPerPage != 0){
                    $scope._pageRange.push(i);
                }
            }
            
            $scope.$watch('[config.rowsPerPage, config._tBodyClone.length]', function(nV, oV){
                _numberOfPages();    
            });
            
            $scope.isNumber = function(val){
                return typeof val === 'number';
            }

            
            $scope.herchecking = function(){
                console.log($scope.checking)
            }
        }
    }
}])

app.directive('customRowClass', ['$filter', function ($filter){
    return {
        link: function($scope,$elem,$attr){ 
            //adding color scheme for each row        
            if($scope.config.rowColorScheme){
                $scope.config.rowColorScheme.forEach(function(colorScheme){
                    if(eval('$scope.' + colorScheme.expression)){
                        $elem.addClass(colorScheme.class);
                    }
                });
            }

            
            //changing row color if the a row is selected
            $scope.$watch('tRow._selected', function(newValue, oldValue){
                if($scope.config.selectedRowColor){
                    if($scope.tRow._selected){
                        $elem.addClass('selected-row-color');
                    }else{
                        $elem.removeClass('selected-row-color');
                    }
                }
            })

            //hides the row if the row index is allowed to showing the current page index
            var pagination = function(){
                if($scope.config.rowsPerPage){
                    var showBetween = $scope.config._currentPage * $scope.config.rowsPerPage;
                    if($scope.$index < showBetween-$scope.config.rowsPerPage || $scope.$index >= showBetween){
                        $elem.addClass('hidden');
                    }else{
                        $elem.removeClass('hidden');
                    }
                }

                if($scope.config._currentPage * $scope.config.rowsPerPage > $scope.config._tBodyClone.length + $scope.config.rowsPerPage){
                    $scope.config._currentPage = 1;
                }
            }
            
            pagination();
            
            //pagination need to recalled if the rows per pageor current page changes, watching $index while sorting it makes sure sorts all items instead of current page
            $scope.$watch('[config.rowsPerPage,config._currentPage, $index]', function(nV, oV){
                pagination()
            });
            
        }
    }
}])


//filter for substring for string based rows
app.filter('search', function () {
    return function (list, query, fields) {
        
        if (!query) {
            return list;
        }
        
        query = query.toLowerCase().split(' ');
        
        if (!angular.isArray(fields)) {
            fields = [fields.toString()];
        }
        
        return list.filter(function (item) {
            return query.every(function (needle) {
                return fields.some(function (field) {
                    var content = item[field] != null ? item[field] : '';
                    
                    if (!angular.isString(content)) {
                        content = '' + content;
                    }
                    return content.toLowerCase().indexOf(needle) > -1;
                });
            });
        });
    };
});

//greter than or lower than
app.filter('evalExp', function () {
    return function(items, exp) { 
        items = items.filter(function(tRow){
            try {
                if(eval(exp)){
                    return true
                }else{
                    return false;
                }
            }catch(err){
                console.log('option evaluation failiure')
                return false;
            }
            return item.price > greaterThan && item.price < lowerThan;
        });

        //then we return the filtered items array
        return items;
    };
});