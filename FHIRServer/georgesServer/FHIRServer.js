var ccda = require('ccda');
var url = require('url');
var ccda2fhir = require('ccda2fhir');
var util = require('util');

var isValidUser = function(auth) {
  if (auth === 'thisisrob') return true;
  return false;
};

module.exports = {

  parse: function(ewd) {
    if (isValidUser(ewd.query.rest_auth)) {
      var pieces = ewd.query.rest_path.split('/');
      if (pieces[1] === 'patient') {
        var patientId = pieces[2].slice(1);
        if (pieces[3] === 'observation') {
          var vitals = ccda.getVitals('ccda', patientId, ewd);
          var observation = ccda2fhir.observation(vitals, ewd.query.url);
          return observation;
        }
        else {
          return {error: 'Invalid Request: ' + pieces[3]};
        }
      }
      else {
        return {error: 'Invalid Request: ' + pieces[1]};
      }
    }
    else {
      return {
        error: 'Invalid Authorization'
      };
    }
  }
};