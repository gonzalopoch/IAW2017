var myApp = angular.module('myApp', ['ui.router','angularUtils.directives.dirPagination','ngResource']);


myApp.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})
 
myApp.constant('API_ENDPOINT', {
  url: 'http://localhost:3000/api/v1/users'
});

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
  
  $urlRouterProvider.otherwise('/index/home');
    
  $stateProvider
  
  .state('outside', {
    url: '/index',
    abstract: true,
    templateUrl: 'outside.html'
  })

  .state('outside.home', {
    url: '/home',
    templateUrl: 'home.html',
    controller: 'LoginCtrl'
  })
  
  .state('outside.register', {
    url: '/register',
    templateUrl: 'register.html',
    controller: 'RegisterCtrl'
  
  })
  
  .state('campaigns', {
    url: '/campanas',
    templateUrl: 'campaigns.html',
    controller: 'CampaignIndexCtrl'
  })
  
  .state('showcampaign', {
    url: '/campanas/:id',
    templateUrl: 'campaign-detail.html',
    controller: 'CampaignShowCtrl'
  })
  
  .state('newcampaign', {
    url: '/new',
    abstract: true,
    templateUrl: 'new-campaign-abstract.html',
    controller: 'CampaignNewCtrl'
  })

  .state('newcampaign.body', {
    url: '',
    templateUrl: 'new-campaign.html',
    controller: 'CampaignNewCtrl'
  })
  
  .state('newcampaign.contacts', {
    url: '/destinatarios',
    templateUrl: 'select-contacts.html',
    controller: 'CampaignNewCtrl'
  })

  .state('showinfo', {
    url: '/info',
    templateUrl: 'showinfo.html',
    controller: 'InsideCtrl'
  })
  
  .state('contacts', {
    url: '/contactos',
    templateUrl: 'contacts.html',
    controller: 'ContactIndexCtrl'
  });


});

myApp.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      console.log(next.name);
      if (next.name !== 'outside.home' && next.name !== 'outside.register') {
        event.preventDefault();
        $state.go('outside.home');
      }
    }
  });
});

myApp.service('AuthService', function($q, $http, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var LOCAL_ID = '';
  var isAuthenticated = false;
  var authToken;
 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }
 
  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  // function getId() {
  //   var id = 
  //   return LOCAL_TOKEN_KEY;
  // }
 
  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common.Authorization = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }
 
  var register = function(user, pass) {
    user.password = pass.password;
      return $q(function(resolve, reject) {
        if (!user.username || !pass.password || !pass.password2 || !user.mail || !user.mailpass) {
          reject('Complete los campos marcados con asteriscos.');
        } else {
          $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
            if (result.data.success) {
              resolve(result.data.msg);
            } else {
              reject(result.data.msg);
            }
          });
        }
      });
    
  };
 
  var login = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
        if (result.data.success) {
          storeUserCredentials(result.data.token);
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  loadUserCredentials();
 
  return {
    login: login,
    register: register,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
  };
})
 
myApp.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});




myApp.controller('LoginCtrl', function($scope, AuthService, $state) {
  $scope.user = {
    username: '',
    password: ''
  };
 
  $scope.login = function() {
    if ($scope.user.username == '' || $scope.user.password == ''){
      alert('Inicio de sesión fallido!\nIngrese un usuario y una contraseña.')
    }else{
      AuthService.login($scope.user).then(function(msg) {
        $state.go('campaigns');
      }, function(errMsg) {
        alert('Inicio de sesión fallido!\n'+errMsg);
      });
    }
    
  };
})
 
myApp.controller('RegisterCtrl', function($scope, AuthService, $state) {
  
  $scope.pass = {
    password: '',
    password2: '',
  };
  $scope.user = {
    username: '',
  };
 
  $scope.signup = function() {
    if ($scope.pass.password === $scope.pass.password2){    
      AuthService.register($scope.user,$scope.pass).then(function(msg) {
        $state.go('campaigns');
        alert('Registro exitoso!\n'+msg);
      }, function(errMsg) {
        alert('Registro fallido!\n'+errMsg);      
        $scope.pass.password = '';
        $scope.pass.password2 = '';
      });
    }else{
      alert ('Registro fallido! Las contraseñas no coinciden.')

    }
    
  };
})



myApp.controller('InsideCtrl', function($scope, AuthService, API_ENDPOINT, $http, $state) {
  
  $http.get(API_ENDPOINT.url + '/memberid').then(function(result) {
    $scope.user = result.data;
  });

  $scope.destroySession = function() {
    AuthService.logout();
  };

  $scope.getInfo = function() {
    $http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
      $scope.memberinfo = result.data;
      $state.go('showinfo');
    });
  };

  $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.home');
  };
})
 
myApp.controller('AppCtrl', function($scope, $state, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('outside.login');
    alert('Login failed!\nSorry, You have to login again.');
  });
});
































myApp.factory("Contact", function($resource) {
  return $resource("/api/v1/contacts/:id", {}, {
    update: {method:'PUT', params: {name: '@name', mail: '@mail', phone: '@phone', tag: '@tag'}}
  });
});

myApp.controller("ContactIndexCtrl", function($scope, Contact, $http, API_ENDPOINT) {

  $http.get(API_ENDPOINT.url + '/memberid').then(function(result) {
    $scope.currentuser = result.data.username;
  });

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
    if (name && mail){
      Contact.save({name: name, mail: mail, phone: phone, tag: tag, user:$scope.currentuser});
      $scope.newName = "";
      $scope.newMail = "";
      $scope.newPhone = "";
      $scope.newTag = "";
      Contact.query(function(data) {
      $scope.contacts = data;
    });
    }
    else{
      alert('Ingrese nombre y correo.');
    }
  };

});









myApp.factory("Campaign", function($resource) {
  return $resource("/api/v1/campaigns/:id");
});

myApp.controller("CampaignIndexCtrl", function($scope, Campaign, $http, API_ENDPOINT) {

  $http.get(API_ENDPOINT.url + '/memberid').then(function(result) {
    $scope.currentuser = result.data.username;
  });

  Campaign.query(function(data) {
    $scope.campaigns = data;
  });

  $scope.currentPage = 1;
  $scope.pageSize = 10;
  $scope.sortKey = 'date';
  $scope.reverse = true;
  $scope.sort = function(keyname){
      $scope.sortKey = keyname;   //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  };

  $scope.deleteCampaignItem = function(campaignItem)  {
    if (confirm("Seguro que desea eliminar?")){
      Campaign.delete({ id: campaignItem.id });
    }
    Campaign.query(function(data) {
      $scope.campaigns = data;
    });
  };

});

myApp.controller("CampaignShowCtrl", function($scope, Campaign, $stateParams, $sce) {
  var id = $stateParams.id;

  Campaign.get({ id: id}, function(data) {
    $scope.campaign = data;
    $scope.CampaignBody = $sce.trustAsHtml(data.body);
  });

});

myApp.controller("CampaignNewCtrl", function($scope, $state, Campaign, $stateParams, $http, API_ENDPOINT) {
  
  $http.get(API_ENDPOINT.url + '/memberid').then(function(result) {
    $scope.currentuser = result.data.username;
  });

  $scope.newcampaign = $scope.newcampaign || {};
  $('#summernote').summernote('code', $scope.newcampaign.body);

  // if ($state.current.name === 'newcampaign.contacts'){
  //   console.log("Estado");
  //   if (!$scope.newcampaign){
  //     $state.go('campaigns');
  //   }
  // }

  // if ($scope.newcampaign == null){
  //   console.log("Vacia");
  // }else{
  //   console.log("Hay algo");
  //   if (!$scope.newcampaign)
  //     console.log("Pero no declarado");
  // }

  $scope.selectedcontacts = [];

  $scope.addContacts = function () {
    $('#all-item-list input[type="checkbox"]:checked').each(function() {
      console.log($(this).val())
      var contact = JSON.parse($(this).val());
      contact.state = 'pending';
      contact.seentimes = 0;
      contact.forwardtimes = 0;
      $scope.selectedcontacts.push(contact);
    });
    console.log($scope.selectedcontacts);
  }

  $scope.deleteContacts = function () {
    $('#selected-item-list input[type="checkbox"]:checked').each(function() {
      console.log($(this).val())
      var contact = JSON.parse($(this).val());
      var indx = $scope.selectedcontacts.map(function(el) {
        return el.id;
      }).indexOf(contact.id);
      $scope.selectedcontacts.splice(indx, 1);
    });
    console.log($scope.selectedcontacts);
  }

  $scope.notAdded = (item) => {
    var indx = $scope.selectedcontacts.map(function(el) {
        return el.id;
    }).indexOf(item.id);
    if ( indx == -1 ){
      return item;
    }else { 
      return
    }
  }

  $scope.selectContacts = function (){
    var body = $('#summernote').summernote('code');
    var date = new Date(Date.now());
    if ($scope.newcampaign.name!='' && $scope.newcampaign.name && $scope.newcampaign.mail!='' && $scope.newcampaign.mail ){
      $scope.newcampaign.body = body;
      $scope.newcampaign.date = date.toLocaleDateString('en-GB');
      $scope.newcampaign.time = date.toLocaleTimeString('en-GB');
      $scope.newcampaign.timesopen = 0;
      $scope.newcampaign.user = $scope.currentuser;
      $state.go('newcampaign.contacts');
    }
    else{
      alert('Complete los campos marcados con asteriscos.');
    }
  };

  $scope.goBack = function (){
    $state.go('newcampaign.body');
  }

  $scope.addCampaign = function() {
    $scope.newcampaign.contacts = $scope.selectedcontacts;
    if ($scope.newcampaign.contacts.length > 0){
      Campaign.save($scope.newcampaign);
      $state.go('campaigns');
    }
    else{
      alert('Agregue al menos un destinatario.');
    }
  };

});








































// myApp.controller('paramsController', function($scope, $state, $stateParams) {
//     //..
//     var obj = $stateParams.obj;
    
//     $scope.state = $state.current;
//     $scope.params = $stateParams; 
// });

// myApp.service("CampaignService", ["$q", "$timeout", function($q, $timeout) {
  
//   var campaigns = [{name: "name1", body:"lorem ipsum blabla", date:"05/10/2017", mail: "mail1@iaw.com", timesopen: "5"},{name: "name2", body:"lorem ipsum lalala", date:"06/10/2017", mail: "mail2@iaw.com", timesopen: "3"}];
  
//   this.getCampaigns = function() {
//     var deferred = $q.defer();
    
//     $timeout(function() {
//       deferred.resolve(campaigns);
//     }, 1000); 
    
//     return deferred.promise; 
//   };
  
  
//   this.deleteCampaign = function(campaignItem) {
//     var deferred = $q.defer();
    
//     $timeout(function() {
//       campaigns.splice(campaigns.indexOf(campaignItem), 1);  
//       deferred.resolve();
//     }, 500);
    
//     return deferred.promise;
//   };
  
//   this.addCampaign = function(campaign) {
//     var deferred = $q.defer();
    
//     $timeout(function() {
//       campaigns.push(campaign);  
//       deferred.resolve();
//     }, 500);
    
//     return deferred.promise;
//   };
   
// }]);

// myApp.controller("campaignsController", ["$scope", "CampaignService", function($scope, CampaignService) {
//   $scope.currentPage = 1;
//   $scope.pageSize = 10;
  
//   // model
//   $scope.sort = function(keyname){
//       $scope.sortKey = keyname;   //set the sortKey to the param passed
//       $scope.reverse = !$scope.reverse; //if true make it false and vice versa
//   };
  
//   $scope.refreshCampaigns = function() {
//     CampaignService.getCampaigns().then(function(campaigns) {
//       $scope.campaigns = campaigns;
//     });  
//   };
  
//   $scope.refreshCampaigns();
  
//   $scope.addCampaign = function(name,date,mail,timesopen, body) {
//     CampaignService.addCampaign({name: name, date: date, mail: mail, timesopen: timesopen, body: body}).then(function() {
//       console.log("Campaign added");
//       $scope.refreshCampaigns();
//     });
//     $scope.newName = "";
//     $scope.newMail = "";
//     $scope.newBody = "";
//   };

//   $scope.deleteCampaignItem = function(campaignItem)  {
//     if (confirm("Seguro que desea eliminar?")){
//     CampaignService.deleteCampaign(campaignItem).then(function() {
//       console.log("Campaign deleted");
//       $scope.refreshCampaigns();
//     });
//     }
//   };
  
// }]);