
function myCtrl($scope, $http) {
    $http.get('parks.json').success(function(data) {
        $scope.parks = data.Parks.map((p)=>{
          p.showTableflag=false;
          if((p.details.Area.substr(0,p.details.Area.indexOf(' '))).replace(/\,/g,'')>2000){
            p.color = '#ffffff';
          }
          return p
        });
    });
    
    $scope.showTable = function(park){
      this.parks.forEach((p)=>{
        if(p.name===park.name){
          p.showTableflag = !p.showTableflag;
        }
      })
    }
}