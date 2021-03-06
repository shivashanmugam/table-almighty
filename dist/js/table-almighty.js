var tableAlmightyApp = angular.module('tableAlmightyApp', ['ui.sortable']);
tableAlmightyApp.directive('tableAlmighty', ['$filter','$compile', function ($filter, $compile){
    return {
        template:'<div class=row><div class=col-xs-4><span ng-class="config.customClass.tableLabel ? config.customClass.tableLabel : \'\'" ng-if=config.toolSwitch.selectRowEnabled>{{config.customLabels.selectedCount ? config.customLabels.selectedCount : \'Selected Items\'}} : {{_tAVars.selectedRows.length}}</span></div></div><div class=row><div class=col-xs-6><div ng-repeat="action in config.tableActions"><button ng-attr-title={{action.toolTip}} ng-click=action.fn() ng-class="config.customClass.tableActionButton ? config.customClass.tableActionButton : \'btn btn-xs btn-default pull-left\'"><i ng-class="action.FAIcon ? action.FAIcon : \'\' " class=fa></i> &nbsp;{{action.text}}</button></div></div><div class=col-xs-6><span ng-class="config.customClass.tableLabel ? config.customClass.tableLabel : \'\'" ng-if="config.rowsPerPage && config.rowsPerPageOptions" class=pull-right>{{config.customLabels.rowsPerPage ? config.customLabels.rowsPerPage : \'Rows Per Page\'}}<select ng-model=config.rowsPerPage ng-class="config.customClass.selectBox ? config.customClass.selectBox : \'\'" ng-init="tHead.search._input= \'\'"><option ng-value=opt ng-repeat="opt in config.rowsPerPageOptions">{{opt}}</option><option ng-value=100000>all</option></select></span></div></div><table ng-class="config.customClass.table ? config.customClass.table : \'table\'"><thead><tr><th ng-if=config.toolSwitch.selectRowEnabled><input ng-change="selectRow(\'selectAll\')" ng-model=_tAVars.selectAll type=checkbox><span></span></th><th ng-repeat="tHead in config.tHeads track by $index" ng-class="{\'cursor-pointer\' : config.toolSwitch.sortingEnabled, \'{{tHead.headerAlign}}\' : tHead.headerAlign}"><span ng-click=sort(tHead)>{{tHead.text}}</span> <span ng-if=config.toolSwitch.sortingEnabled class=fa ng-show="tHead.property == _tAVars.sortHead" ng-class="{\'fa-sort-asc\': !_tAVars.sortReverse, \'fa-sort-desc\': _tAVars.sortReverse}"></span></th><th ng-if="config.rowActions.length > 0"></th></tr><tr class=tableFilter ng-hide=!config.toolSwitch.filterRowEnabled><td ng-if=config.toolSwitch.selectRowEnabled></td><td ng-repeat="tHead in config.tHeads"><span ng-if="tHead.search.type == \'INPUT\'"><input ng-class="config.customClass.filterInputBox ? config.customClass.filterInputBox : \'\'" ng-model=tHead.search._input type=text ng-change=search(tHead)></span> <span ng-if="tHead.search.type == \'SELECT\'"><select ng-class="config.customClass.selectBox ? config.customClass.selectBox : \'\'" ng-init="tHead.search._input= \'\'" ng-model=tHead.search._input ng-change=search(tHead)><option selected ng-value="\'\'">{{config.customLabels.selectSearchDefault ? config.customLabels.selectSearchDefault : \'[Clear]\'}}</option><option ng-value=opt ng-change="search(\'filterSearch\')" ng-model=tHead.search._input ng-repeat="opt in tHead.search.options">{{ opt.text ? opt.text : opt }}</option></select></span></td><td ng-if="config.rowActions.length > 0"></td></tr></thead><tbody ui-sortable=config.sortableOptions><tr ng-class="!config.sortableOptions.disabled ? \'cursor-move\' : \'\'" custom-row-class="" ng-repeat="tRow in config._tBodyClone | orderBy:_tAVars.sortHead:_tAVars.sortReverse track by tRow[config.trackBy]"><td ng-if=config.toolSwitch.selectRowEnabled><input ng-model=tRow._selected ng-change="selectRow(\'row\', tRow._selected)" type=checkbox></td><td ng-class="{\'{{tHead.customColumnClass}}\' : tHead.customColumnClass }" ng-repeat="tHead in config.tHeads" ng-bind="config.getCellData(tRow, tHead.property)"></td><td ng-if=config.rowActions><span ng-repeat="action in config.rowActions"><button ng-attr-title={{action.toolTip}} type=button ng-class="config.customClass.rowActionButton ? config.customClass.rowActionButton : \'btn btn-xs btn-default\'" ng-click=action.fn(tRow[config.trackBy])>{{action.text}}<i class=fa ng-class=action.FAIcon></i></button></span></td></tr></tbody></table><div ng-if=config.rowsPerPage class="pagination-container pull-right"><ul ng-class="config.customClass.pagination ? config.customClass.pagination  : \'pagination\' "><li ng-click="_tAVars.currentPage = i" ng-repeat="i in _tAVars.pageRange" ng-class="_tAVars.currentPage == i ? \'active\' : \'\'"><a>{{i}}</a></li></ul></div>',
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