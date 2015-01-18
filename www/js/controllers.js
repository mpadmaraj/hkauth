angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, auth, $state, store) {
  auth.signin({
    closable: false,
    // This asks for the refresh token
    // So that the user never has to log in again
    authParams: {
      scope: 'openid offline_access'
    }
  }, function(profile, idToken, accessToken, state, refreshToken) {
    store.set('profile', profile);
    store.set('token', idToken);
    store.set('refreshToken', refreshToken);
    console.log(store);
    $state.go('tab.dash');
  }, function(error) {
    console.log("There was an error logging in", error);
  });
})


.controller('DashCtrl', function($scope, $http,store,recordService,$log) {
      console.log(store.get('profile').user_id);
      $scope.record={};
  $scope.startRecording = function() {
    // Just call the API as you'd do using $http
    $scope.measure={};
    $scope.measure.bp=$scope.record.bp==true?'Y':'N';
    $scope.measure.pulse=$scope.record.pulse==true?'Y':'N';
    $scope.measure.spo2=$scope.record.spo2==true?'Y':'N';
    $scope.measure.machinename='rasp1';
    $scope.measure.user=store.get('profile').user_id;
    $log.debug( $scope.measure);
    $http({
      url: 'http://localhost:3000/startRecordingForUser',
      method: 'GET',
      params:$scope.measure
    }).
        success(function (data, status, headers, config) {
          console.log(data);
          recordService.measuredData=data;
        }).
        error(function (data, status, headers, config) {
          // $scope.name = 'Error!';
        });
  }
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope, auth, $state, store) {

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login');
  }
});
