var myApp = angular.module('myApp', ['ui.router','angularUtils.directives.dirPagination','ngResource']);

myApp.run(function ($state,$rootScope) {
    $rootScope.$state = $state;
});

myApp.directive("summerNote", function(){
  return {
  
    link: function (scope, el, attr) {

      el.summernote({
        height: 200,        // set editor height
        minHeight: null,    // set minimum height of editor
        maxHeight: null,    // set maximum height of editor
        focus: false        // set focus to editable area after initializing summernote
      });
    }
  };
});

myApp.config(function($stateProvider,$urlRouterProvider) {
  
  $urlRouterProvider.otherwise('/campañas');
    
  $stateProvider
  
  .state('home',{
    url: '/home',
    templateUrl: 'home.html'
  })
  
  .state('register',{
    url: '/register',
    templateUrl: 'register.html'
  })
  
  .state('campaigns', {
    url: '/campañas',
    templateUrl: 'campaigns.html',
    controller: 'campaignsController'
  })
  
  .state('detail', {
    url: '/campañas/detail/:obj',
    templateUrl: 'campaign-detail.html',
    controller: 'paramsController'
  })
  
  .state('newcampaign', {
    url: '/campañas/new',
    templateUrl: 'new-campaign.html',
    controller: 'campaignsController'
  })
  
  .state('selectcontacts', {
    url: '/campañas/new/destinatarios/',
    templateUrl: 'select-contacts.html',
    controller: 'contactsController'
  })
  
  .state('contacts', {
    url: '/contactos',
    templateUrl: 'contacts.html',
    controller: 'ContactIndexCtrl'
  });
  
});


myApp.factory("Contact", function($resource) {
  return $resource("/api/v1/contacts/:id", {}, {
    update: {method:'PUT', params: {name: '@name', mail: '@mail', phone: '@phone', tag: '@tag'}}
  });
});

myApp.controller("ContactIndexCtrl", function($scope, Contact) {

  Contact.query(function(data) {
    $scope.contacts = data;
  });

  $scope.currentPage = 1;
  $scope.pageSize = 10;
  $scope.sort = function(keyname){
      $scope.sortKey = keyname;   //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  };

  $scope.editContactEnable = function(contact){
    if (contact != null){
      $scope.editKey = contact.id;
      $scope.editName = contact.name;
      $scope.editMail = contact.mail;
      $scope.editPhone = contact.phone;
      $scope.editTag = contact.tag;
    }else {
      $scope.editKey = null;
    }
    
  };

  $scope.editContact = function(contactItem,name,mail,phone,tag) {
    if (confirm("Seguro que desea actualizar el contacto?")){
      Contact.update({id: contactItem.id}, {name: name, mail: mail, phone: phone, tag: tag});
      $scope.editContactEnable(null);
      Contact.query(function(data) {
        $scope.contacts = data;
      });
    }
  }

  $scope.deleteContactItem = function(contactItem)  {
    if (confirm("Seguro que desea eliminar?")){
      Contact.delete({ id: contactItem.id });
    }
    Contact.query(function(data) {
      $scope.contacts = data;
    });
  };

  $scope.addContact = function(name,mail,phone,tag) {
    Contact.save({name: name, mail: mail, phone: phone, tag: tag});
    $scope.newName = "";
    $scope.newMail = "";
    $scope.newPhone = "";
    $scope.newTag = "";
    Contact.query(function(data) {
      $scope.contacts = data;
    });
  };

});

myApp.service("CampaignService", ["$q", "$timeout", function($q, $timeout) {
  
  var campaigns = [{name: "name1", body:"lorem ipsum blabla", date:"05/10/2017", mail: "mail1@iaw.com", timesopen: "5"},{name: "name2", body:"lorem ipsum lalala", date:"06/10/2017", mail: "mail2@iaw.com", timesopen: "3"}];
  
  this.getCampaigns = function() {
    var deferred = $q.defer();
    
    $timeout(function() {
      deferred.resolve(campaigns);
    }, 1000); 
    
    return deferred.promise; 
  };
  
  
  this.deleteCampaign = function(campaignItem) {
    var deferred = $q.defer();
    
    $timeout(function() {
      campaigns.splice(campaigns.indexOf(campaignItem), 1);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  };
  
  this.addCampaign = function(campaign) {
    var deferred = $q.defer();
    
    $timeout(function() {
      campaigns.push(campaign);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  };
   
}]);

myApp.controller("campaignsController", ["$scope", "CampaignService", function($scope, CampaignService) {
  $scope.currentPage = 1;
  $scope.pageSize = 10;
  
  // model
  $scope.sort = function(keyname){
      $scope.sortKey = keyname;   //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  };
  
  $scope.refreshCampaigns = function() {
    CampaignService.getCampaigns().then(function(campaigns) {
      $scope.campaigns = campaigns;
    });  
  };
  
  $scope.refreshCampaigns();
  
  $scope.addCampaign = function(name,date,mail,timesopen, body) {
    CampaignService.addCampaign({name: name, date: date, mail: mail, timesopen: timesopen, body: body}).then(function() {
      console.log("Campaign added");
      $scope.refreshCampaigns();
    });
    $scope.newName = "";
    $scope.newMail = "";
    $scope.newBody = "";
  };
  
  $scope.deleteCampaignItem = function(campaignItem)  {
    if (confirm("Seguro que desea eliminar?")){
    CampaignService.deleteCampaign(campaignItem).then(function() {
      console.log("Campaign deleted");
      $scope.refreshCampaigns();
    });
    }
  };
  
}]);

myApp.controller('paramsController', function($scope, $state, $stateParams) {
    //..
    var obj = $stateParams.obj;
    
    $scope.state = $state.current;
    $scope.params = $stateParams; 
});