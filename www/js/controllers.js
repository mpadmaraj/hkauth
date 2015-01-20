angular.module('starter.controllers', [])

    .controller('LoginCtrl', function ($scope, auth, $state, store,$http) {
        auth.signin({
            closable: false,
            // This asks for the refresh token
            // So that the user never has to log in again
            authParams: {
                scope: 'openid offline_access'
            }
        }, function (profile, idToken, accessToken, state, refreshToken) {
            store.set('profile', profile);
            store.set('token', idToken);
            store.set('refreshToken', refreshToken);
            console.log(store);
            $state.go('tab.record');
        }, function (error) {
            console.log("There was an error logging in", error);
        });
    })


    .controller('DashCtrl', function ($scope, $http, store, recordService, $log,hkSocket,$state) {
        $http({
            method: 'GET',
            url: SERVER_URL+'/getUserRecording',
            params:{user:store.get('profile').user_id}
        }).
            success(function (data, status, headers, config) {
                // $scope.name = data.name;
                $log.debug( data);
                $scope.records=data;
            }).
            error(function (data, status, headers, config) {
                // $scope.name = 'Error!';
            });
    })
    .controller('AccountCtrl', function ($scope, recordService, $state, store,auth) {

        $scope.logout = function () {
            auth.signout();
            store.remove('token');
            store.remove('profile');
            store.remove('refreshToken');
            $state.go('login');
        }
    })
    .controller('RecordCtrl', function ($scope, $http, store, recordService, $log,hkSocket,$state) {

        console.log(store.get('profile').user_id);
        $scope.hide = true;
        $scope.record = {};
        $scope.showBPMessage = function () {
            if ($scope.record.bp == true) {
                $scope.record.message = "Please make sure you have already taken reading on the BP machine before clicking \"Record\"";
                $scope.hide = false;
            } else {
                $scope.record.message = null;
                $scope.hide = true;
            }
        }
        $scope.startRecording = function () {
            // Just call the API as you'd do using $http
            $scope.measure = {};
            $scope.measure.bp = $scope.record.bp == true ? 'Y' : 'N';
            $scope.measure.pulse = $scope.record.pulse == true ? 'Y' : 'N';
            $scope.measure.spo2 = $scope.record.spo2 == true ? 'Y' : 'N';
            $scope.measure.machinename = 'rasp1';
            $scope.measure.user = store.get('profile').user_id;
            $log.debug($scope.measure);
            $http({
                url: SERVER_URL+'/startRecordingForUser',
                method: 'GET',
                params: $scope.measure
            }).
                success(function (data, status, headers, config) {
                    console.log(data);
                    // recordService.measuredData = data;
                }).
                error(function (data, status, headers, config) {
                    // $scope.name = 'Error!';
                });
        };
        $scope.$on('socket:broadcast', function(event, data) {
            $log.debug( data);
            $scope.data=data.payload;
            if($scope.data.username==store.get('profile').user_id){
                recordService.measure=$scope.data;
                $state.go('tab.results');
            }

        });



    })
    .controller('ResultCtrl', function ($scope, $http, store, recordService, $log,hkSocket,$state) {
        $scope.measure=recordService.measure;


    });
