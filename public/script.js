var myApp = angular.module('myApp', ['ui.router','angularUtils.directives.dirPagination','ngResource']);


myApp.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})
 
myApp.constant('API_ENDPOINT', {
  url: 'http://localhost:3000/api/v1'
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
  })
  
  .state('newcampaign.contacts', {
    url: '/destinatarios',
    templateUrl: 'select-contacts.html',
  })

  .state('account', {
    url: '/cuenta',
    templateUrl: 'account.html',
    controller: 'AccountCtrl'
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
          $http.post(API_ENDPOINT.url + '/users/signup', user).then(function(result) {
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
      $http.post(API_ENDPOINT.url + '/users/authenticate', user).then(function(result) {
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

myApp.factory("Users", function($resource) {
  return $resource("/api/v1/users/edit", null, {
    update: {method:'PUT'}
  });
});

myApp.controller('AccountCtrl', function($scope, $q, $http, $state, API_ENDPOINT, Users, AuthService) {
  $scope.editEnable = false;
  $scope.user = {
    username: '',
    name: '',
    lastname: '',
    mail: '',
    mailpass: '',
    password: '',
  };


  $http.get(API_ENDPOINT.url + '/users/memberid').then(function(result) {
    $scope.user = result.data;
    $scope.user.password = '';
  });

  $scope.editChange = function (){
    $scope.editEnable = !$scope.editEnable;
    $http.get(API_ENDPOINT.url + '/users/memberid').then(function(result) {
      $scope.user = result.data;
      $scope.user.password = '';
    });
  };

  $scope.editUser = function (){

      if (!$scope.user.password || $scope.user.password == '' || !$scope.user.mail || $scope.user.mail == '' || !$scope.user.mailpass || $scope.user.mailpass == '') {
        alert('Complete los campos marcados con asteriscos.');
      } else {
        Users.update($scope.user).$promise.then(function(succMsg){
          alert(succMsg.msg);
          AuthService.login($scope.user).then(function(msg) {
            $scope.user.password = '';
            $scope.editChange();
          }, function(errMsg) {
          });
        }, function(errMsg){
          alert(errMsg.data.msg);
        });
      }
  }

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
        AuthService.login($scope.user).then(function() {
          alert('Registro exitoso!\n');
          $state.go('campaigns');
        }, function() {
          alert('Inicio de sesión fallido!\n');
        });
      }, function(errMsg) {
        alert('Registro fallido!\n'+errMsg);      
        $scope.pass.password = '';
        $scope.pass.password2 = '';
      });
    }else{
      alert ('Registro fallido! Las contraseñas no coinciden.')
      $scope.pass.password = '';
      $scope.pass.password2 = '';
    }
    
  };
})



myApp.controller('InsideCtrl', function($scope, AuthService, API_ENDPOINT, $http, $state) {

  $scope.destroySession = function() {
    AuthService.logout();
  };

  $scope.logout = function() {
    if (confirm("Seguro que desea cerrar sesión?")){
      AuthService.logout();
      $state.go('outside.home');
    }
  };
})
 
myApp.controller('AppCtrl', function($scope, $state, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('outside.login');
    alert('Login failed!\nSorry, You have to login again.');
  });
});








myApp.factory("Contacts", function($resource) {
  return $resource("/api/v1/contacts/:id", {}, {
    update: {method:'PUT', params: {name: '@name', mail: '@mail', phone: '@phone', tag: '@tag'}}
  });
});

myApp.controller("ContactIndexCtrl", function($scope, $state, Contacts, $http) {

  Contacts.query(function(data) {
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
      $scope.editKey = contact._id;
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
      Contacts.update({id: contactItem._id}, {name: name, mail: mail, phone: phone, tag: tag}).$promise.then(function(msg){
        $scope.editContactEnable(null);
        Contacts.query(function(data) {
          $scope.contacts = data;
        });
      });

    }
  }

  $scope.deleteContactItem = function(contactItem)  {
    if (confirm("Seguro que desea eliminar?")){
      Contacts.delete({ id: contactItem._id }).$promise.then(function(msg){
        Contacts.query(function(data) {
          $scope.contacts = data;
        });
      });
    }
  };

  $scope.addContact = function() {
    if ($scope.newName && $scope.newMail){
      Contacts.save({name: $scope.newName, mail: $scope.newMail, phone: $scope.newPhone, tag: $scope.newTag}).$promise.then(function(msg){
        $scope.newName = "";
        $scope.newMail = "";
        $scope.newPhone = "";
        $scope.newTag = "";
        Contacts.query(function(data) {
          $scope.contacts = data;
        });
      });
    }
    else{
      alert('Ingrese nombre y correo.');
    }
  };

  $scope.newCampaign = function(){
    Contacts.query(function(data) {
      if (data.length > 0){
        $state.go('newcampaign.body');
      }else{
        if (confirm("Agregue algún contacto antes de crear una campaña")){
          $state.go('contacts');
        }
      }
    });
  };

});









myApp.factory("Campaigns", function($resource) {
  return $resource("/api/v1/campaigns/:id");
});

myApp.controller("CampaignIndexCtrl", function($scope, Campaigns, $http) {

  Campaigns.query(function(data) {
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
      Campaigns.delete({ id: campaignItem._id }).$promise.then(function(msg){
        Campaigns.query(function(data) {
          $scope.campaigns = data;
        });
      });
    }
  };

});


myApp.controller("CampaignShowCtrl", function($scope, Campaigns, $stateParams, $sce) {
  var id = $stateParams.id;
  $scope.currentPage = 1;
  $scope.pageSize = 10;

  Campaigns.get({ id: id}, function(data) {
    $scope.campaign = data;
    $scope.CampaignBody = $sce.trustAsHtml(data.body); // ESTO PODRIA SER INSEGURO
  });

});



myApp.controller("CampaignNewCtrl", function($scope, $state, $stateParams, Campaigns, $http) {

  if ($state.current.name == 'newcampaign.contacts' && !$scope.newcampaign){ 
    $state.go('newcampaign.body');
  }

  if ($state.current.name == 'newcampaign.contacts' || $state.current.name == 'newcampaign.body'){
    // window.onbeforeunload = function(evt) {
    //   return true;
    // }
    $scope.$on('$stateChangeStart', function(event,tS) {
      if (!(tS.name == 'newcampaign.body' || tS.name == 'newcampaign.contacts'|| tS.name == 'showcampaign') ){
        if (!confirm("Seguro que deseas salir de esta página?\nPerderás cualquier cambio hecho...")) {
            event.preventDefault();
        }
      }  
    });
  }

  $scope.newcampaign = $scope.newcampaign || {};
  $('#summernote').summernote('code', $scope.newcampaign.body);

  $scope.selectedcontacts = [];

  $scope.addContacts = function () {
    $('#all-item-list input[type="checkbox"]:checked').each(function() {
      //console.log($(this).val())
      var contact = JSON.parse($(this).val());
      contact.state = false;
      contact.seentimes = 0;
      $scope.selectedcontacts.push(contact);
    });
    //console.log($scope.selectedcontacts);
  }

  $scope.deleteContacts = function () {
    $('#selected-item-list input[type="checkbox"]:checked').each(function() {
      //console.log($(this).val())
      var contact = JSON.parse($(this).val());
      var indx = $scope.selectedcontacts.map(function(el) {
        return el._id;
      }).indexOf(contact._id);
      $scope.selectedcontacts.splice(indx, 1);
    });
    //console.log($scope.selectedcontacts);
  }

  $scope.notAdded = (item) => {
    var indx = $scope.selectedcontacts.map(function(el) {
        return el._id;
    }).indexOf(item._id);
    if ( indx == -1 ){
      return item;
    }else { 
      return
    }
  }

  $scope.goBack = function (){
    $state.go('newcampaign.body');
    $scope.$on('$stateChangeSuccess', function(event,) {
      $('#summernote').summernote('code', $scope.newcampaign.body);
    });
  }

  $scope.selectContacts = function (){
    var body = $('#summernote').summernote('code');
    var date = new Date(Date.now());
    if ($scope.newcampaign.name!='' && $scope.newcampaign.name && $scope.newcampaign.sender!='' && $scope.newcampaign.sender ){
      $scope.newcampaign.body = body;
      $scope.newcampaign.date = date.toLocaleDateString('en-GB');
      $scope.newcampaign.time = date.toLocaleTimeString('en-GB');
      $scope.newcampaign.timesopen = 0;
      $state.go('newcampaign.contacts');
    }
    else{
      alert('Complete los campos marcados con asteriscos.');
    }
  };

  $scope.addCampaign = function() {
    $scope.newcampaign.contacts = $scope.selectedcontacts;
    $scope.loading = true;
    if ($scope.newcampaign.contacts.length > 0){
      document.body.style.cursor = "wait";

      Campaigns.save($scope.newcampaign).$promise.then(function(msg){
        $state.go('showcampaign',{id: msg.id});
        document.body.style.cursor = "auto";
        $scope.loading = false;
      }, function(err){
        alert(err.data.msg || err.statusText);
        document.body.style.cursor = "auto";
        $scope.loading = false;
      }); 
    }
    else{
      alert('Agregue al menos un destinatario.');
      $scope.loading = false;
    }
  };

});