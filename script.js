



angular.module('iaw', [])
.service("ContactService", ["$q", "$timeout", function($q, $timeout) {
  
  var contacts = [{name: "name1", mail:"mail1@iaw.com", phone: "112332224", tag: "tag1"},{name: "name2", mail:"mail2@iaw.com", phone: "145332224", tag: "tag1"}];
  
  this.getContacts = function() {
    var deferred = $q.defer();
    
    $timeout(function() {
      deferred.resolve(contacts);
    }, 1000); 
    
    return deferred.promise; 
  }
  
  
  this.deleteContact = function(contactItem) {
    var deferred = $q.defer();
    
    $timeout(function() {
      contacts.splice(contacts.indexOf(contactItem), 1);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  }
  
  this.addContact = function(contact) {
    var deferred = $q.defer();
    
    $timeout(function() {
      contacts.push(contact);  
      deferred.resolve();
    }, 500);
    
    return deferred.promise;
  }
   
}])
.controller("contactListController", ["$scope", "ContactService", function($scope, ContactService) {
  
  // model
  $scope.refreshContacts = function() {
    ContactService.getContacts().then(function(contacts) {
      $scope.contacts = contacts;
    });  
  }
  
  $scope.refreshContacts();
  
  $scope.addContact = function(name,mail,phone,tag) {
    ContactService.addContact({name: name, mail: mail, phone: phone, tag: tag}).then(function() {
      console.log("Contact added")
      $scope.refreshContacts();
    });
    $scope.newName = "";
    $scope.newMail = "";
    $scope.newPhone = "";
    $scope.newTag = "";
  }
  
  $scope.deleteContactItem = function(contactItem)  {
    ContactService.deleteContact(contactItem).then(function() {
      console.log("Contact deleted")
      $scope.refreshContacts();
    });
  }
  
}]);

