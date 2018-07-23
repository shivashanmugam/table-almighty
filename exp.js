var app = angular.module('customTable', []);

app.controller('customTableCtrl', function ($scope, $http) {
    $scope.range = [1,2,3,{name:'siva'}]

    $scope.isNumber = function(val){
        console.log('checking');
        console.log(val)
        console.log(typeof val === 'number')
        return typeof val === 'number';
    }
})