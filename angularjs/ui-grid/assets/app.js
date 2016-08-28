var jsonData = {};


//helper function
function isNull(inVar) {
    if (typeof (inVar) == 'undefined') {
        return true;
    }
    else if (typeof (inVar) == 'string') {
        if (inVar == '') {
            return true;
        }                
    }
    else if (typeof (invar) == 'int') {
        if (inVar < 1) {
            return true;
        }
    }
 
    return false;
}




//Angular Code below -------------------------------------------->

var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid']);
app.controller('MainCtrl', ['$scope', '$http', 'uiGridConstants', function ($scope, $http, uiGridConstants) {


    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };


    $scope.gridOptions = {
        enableFiltering: true,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [           
        {
            field: 'name', headerCellClass: $scope.highlightFilteredHeader
        },        
        {
            field: 'age',
            headerCellClass: $scope.highlightFilteredHeader,
            filters: [// multiple filters
                {   condition: uiGridConstants.filter.GREATER_THAN, placeholder: '> than' },
                {   condition: uiGridConstants.filter.LESS_THAN, placeholder: '< than' }
            ]
        },
        {
            field: 'genderHash', displayName: "gender", filter: {
                //term: '1',
                type: uiGridConstants.filter.SELECT,
                selectOptions: [{ value: '1', label: 'male' }, { value: '2', label: 'female' }]
            },
            cellFilter: 'mapGender', headerCellClass: $scope.highlightFilteredHeader
        },
        {
            field: 'company', headerCellClass: $scope.highlightFilteredHeader
        },
        {
            field: 'lob', displayName: "LOB", headerCellClass: $scope.highlightFilteredHeader
        },
        {
            field: 'registered', displayName: "Active Date", cellFilter: 'date:"longDate"', filterCellFiltered: true, width: '150',
        },
        {
            field: 'cni', displayName: "CNI", enableFiltering: false
        },
        {
            field: 'prs', displayName: "Predictive Risk", enableFiltering: false
        },
        //{
        //    field: 'chronics', displayName: "# of Chronics",
        //    filters:[
        //        {   condition: uiGridConstants.filter.GREATER_THAN, placeholder: '> than' },
        //        {   condition: uiGridConstants.filter.LESS_THAN, placeholder: '< than' }
        //    ],
        //},
        {
            field: 'pcp', displayName: "PCP", headerCellClass: $scope.highlightFilteredHeader
        }
    ]
    };

    //get data here
    $http.get('assets/grid-data.json')
        .success(function (data) {
            $scope.gridOptions.data = data;

            data.forEach(function addDates(row, index) {
                var cni = row.cni;
                row.cni = cni.toFixed(2);
                row.genderHash = row.gender === 'male' ? '1' : '2';
            });

            jsonData = data;
      });


    $scope.toggleFiltering = function () {
        $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    };
}])
.filter('mapGender', function () {
    var genderHash = {
        1: 'male',
        2: 'female'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return genderHash[input];
        }
    };
});
