angular.module('nodeTestApp')
  .controller('MainCtrl', function ($scope, $resource, PhaseService) {

    $scope.navPhase = 'all'

    var Project = $resource('http://localhost\\:3000/projects/:id', { cache: true });
    $scope.projects = Project.query();

    PhaseService.phases().then(function(data){
      $scope.phases = data;
    });
  });
