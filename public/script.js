var myApp = angular.module('myApp', ['ui.router','angularUtils.directives.dirPagination']);

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
    controller: 'contactsController'
  });
  
});

myApp.service("ContactService", ["$q", "$timeout", function($q, $timeout) {
  
  var contacts = [{name: "name1", mail:"mail1@iaw.com", phone: "112332224", tag: "tag1"},{name: "name2", mail:"mail2@iaw.com", phone: "145332224", tag: "tag1"}];
  
  this.getContacts = function() {
    var deferred = $q.defer();
    
    $timeout(function() {
      deferred.resolve(contacts);
    }, 1000); 
    
    return deferred.promise; 
  };
  
  
  this.deleteContact = function(contactItem) {
    var deferred = $q.defer();
    
    $timeout(function() {
      contacts.splice(contacts.indexOf(contactItem), 1);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  };
  
  this.addContact = function(contact) {
    var deferred = $q.defer();
    
    $timeout(function() {
      contacts.push(contact);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  };
   
}]);

myApp.controller("contactsController", ["$scope", "ContactService", function($scope, ContactService) {
  
  $scope.currentPage = 1;
  $scope.pageSize = 10;
  
  // model
  $scope.sort = function(keyname){
      $scope.sortKey = keyname;   //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  };
  
  $scope.refreshContacts = function() {
    ContactService.getContacts().then(function(contacts) {
      $scope.contacts = contacts;
    });  
  };
  
  $scope.refreshContacts();
  
  $scope.addContact = function(name,mail,phone,tag) {
    ContactService.addContact({name: name, mail: mail, phone: phone, tag: tag}).then(function() {
      console.log("Contact added");
      $scope.refreshContacts();
    });
    $scope.newName = "";
    $scope.newMail = "";
    $scope.newPhone = "";
    $scope.newTag = "";
  };
  
  $scope.deleteContactItem = function(contactItem)  {
    if (confirm("Seguro que desea eliminar?")){
    ContactService.deleteContact(contactItem).then(function() {
      console.log("Contact deleted");
      $scope.refreshContacts();
    });
    }
  };
  
}]);

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