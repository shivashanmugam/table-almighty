var tableAlmightyApp = angular.module('tableAlmightyApp', ['ui.sortable']);
tableAlmightyApp.directive('tableAlmighty', ['$filter','$compile', function ($filter, $compile){
    return {
        templateUrl:'/src/table-almighty-template.html',
        scope: {
            config: '=' 
        },
        link: function($scope,$elem,$attr){ 

            $scope.config.resetDirective = function(){
                $scope.config._tBodyClone = [];
                $scope.config.tHeads.forEach(function(tHead){
                    if(tHead.search) {
                        tHead.search._input = '';
                    }
                })
                $scope.init();
            }
            //this init will be executed whenever the refresh has been hit, Will be invoked through internalRefreshHook
            $scope.init = function(){
                $scope._tAVars = {
                    currentPage : 1, //Current Page value in pagination
                    selectAll : false, //count, Should be replaced by config.selectedrows.length
                    pageRange : [], //controller variables for check box under each rows
                    sortHead : '', //currently sorted
                    sortReverse : false, //currently sorted reverse sort or not
                    selectedRows : []
                }
                //if the getCell data function is not defined
                if(!$scope.config.getCellData){
                    $scope.config.getCellData = function(row, property) {
                        return row[property]
                    }
                }

                //creating the clone of the original data [ Because filter, search not just hide the unmatched also removes from binded value, so need to keep the original ] 
                $scope.config._tBodyClone = angular.copy($scope.config.tBody);

                if($scope.config._tBodyClone){
                    $scope.config._tBodyClone.forEach(function(tRow) {
                        tRow._selected = false;
                    })            
                }

                // $scope.$watch('[config.tBody, config.tBody.length]', function(newV, oldV){
                //     $scope.search();
                //     _numberOfPages();
                // })
                $scope.$watch(function($scope) {
                    return $scope.config.tBody.length;
                  }, function(newV, oldV){
                    $scope.search();
                    _numberOfPages();
                })  
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
                        tRow._selected = $scope._tAVars.selectAll;
                    })            
                }else{
                    if(!isSelected) $scope._tAVars.selectAll = false;
                }
                _updateSelectedRows();
            }

            //handles sort click on the table header
            $scope.sort = function (header) {
                if($scope.config.toolSwitch.sortingEnabled){
                    $scope._tAVars.sortReverse = (header.property == $scope._tAVars.sortHead) ? !$scope._tAVars.sortReverse : false;
                    $scope._tAVars.sortHead = header.property;
                }
            }       

            //handles all the events of filter row
            $scope.search = function(searchType){
                //pagination comes back to first Back,[ Otherwise its a chaos]
                $scope._tAVars.currentPage = 1;
                
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

                                if(tHead.search.inputType == 'Number'){
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

            $scope.config.getSelectedRows = function(){
                return $scope._tAVars.selectedRows;
            }

            $scope.$watch('[config.rowsPerPage, _tAVars.currentPage, config._tBodyClone.length]', function(nV, oV){
                _numberOfPages();    
            });
        
            $scope.isNumber = function(val){
                return typeof val === 'number';
            }

            function _updateSelectedRows(){
                var selectedRowcount = 0;
                $scope._tAVars.selectedRows = [];
                $scope.config._tBodyClone.forEach(function(tRowClone) {
                    $scope.config.tBody.forEach(function(tRow) {
                        if(tRowClone[$scope.config.trackBy] == tRow[$scope.config.trackBy]){
                            if(tRowClone._selected){
                                selectedRowcount++;
                                $scope._tAVars.selectedRows.push(tRow);
                            } 
                        }
                    })
                })            
            }

            function _numberOfPages(){
                $scope._tAVars.pageRange = [];
                for(var i = 1;i <= ($scope.config._tBodyClone.length / $scope.config.rowsPerPage);i++){
                    $scope._tAVars.pageRange.push(i);
                }
                if($scope.config._tBodyClone.length % $scope.config.rowsPerPage != 0){
                    $scope._tAVars.pageRange.push(i);
                }
            }
        }
    }
}])

tableAlmightyApp.directive('customRowClass', ['$filter', function ($filter){
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
            
            pagination();

            //pagination need to recalled if the rows per pageor current page changes, watching $index while sorting it makes sure sorts all items instead of current page
            $scope.$watch('[config.rowsPerPage, _tAVars.currentPage, $index]', function(nV, oV){
                pagination()
            });

            //hides the row if the row index is allowed to showing the current page index
            function pagination(){
                if($scope.config.rowsPerPage){
                    var showBetween = $scope._tAVars.currentPage * $scope.config.rowsPerPage;
                    if($scope.$index < showBetween-$scope.config.rowsPerPage || $scope.$index >= showBetween){
                        $elem.addClass('hidden');
                    }else{
                        $elem.removeClass('hidden');
                    }
                }

                if($scope._tAVars.currentPage * $scope.config.rowsPerPage > $scope.config._tBodyClone.length + $scope.config.rowsPerPage){
                    $scope._tAVars.currentPage = 1;
                }
            }
        }
    }
}])


//filter for substring for string based rows
tableAlmightyApp.filter('search', function () {
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
tableAlmightyApp.filter('evalExp', function () {
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