(function(global, $) {
  'use strict';

  var Services = {
    init: function() {
      // Services.service1 = new global.Service1();
    }
  }

  global.Services = Services;

  $(function() {
    global.Services.init();
  });

})(this, $);