//var ccda = require('ccda');
var url = require('url');
//var ccda2fhir = require('ccda2fhir');
//var util = require('util');

var isValidUser = function(auth) {
  if (auth === 'thisisrob') return true;
  return false;
};


var getObservations = function(url, patientId, ewd) {
    var fhir = new ewd.mumps.GlobalNode('FHIR', [patientId, 'data']);
    var obs = fhir._getDocument();
    //return obs;
    var entries = [];
    var observation;
    var components;
    var component;
    var entry;
    var j;
    var totalResults = 0;
    //for (var i = 0; i < obs.length; i++) {
    for (var i in obs) {
      totalResults++;
      observation = obs[i];
      entry = {
        title: 'Observation ' + (i + 1),
        id: url + '@' + (i + 1),
        link: {
          href: url + '@' + (i + 1) + '/history/@1',
          rel: 'self'
        },
        updated: new Date(),
        published: new Date(),
        content: {
          appliesDateTime: observation.appliesDateTime,
          '_id': '52d6d9a71743283e240002' + i,
          '__v': 0,
          component: []
        },
        referenceRange: [],
        method: {
          coding: []
        },
        bodySite: {
          coding: []
        },
        interpretation: {
          coding: []
        },
        valueCodeableConcept: {
          coding: []
        },
        name: {
          coding: [{
            system: 'http://loinc.org',
            code: '',
            '_id': '52d6d9a71743283e240002' + i
          }]
        }
      };
      components = observation.component;
      for (j = 0; j < components.length; j++) {
        component = components[j];
        entry.content.component.push(component);
      }
      entries.push(entry);
    }
    observation = {
      title: "Search results for resource type Observation",
      id: url,
      totalResults: totalResults,
      link: {
        href: url,
        rel: 'self'
      },
      updated: new Date(),
      entry: entries
    };
    return observation;
};


module.exports = {

  parse: function(ewd) {
    if (isValidUser(ewd.query.rest_auth)) {
      var pieces = ewd.query.rest_path.split('/');
      if (pieces[1] === 'patient') {
        var patientId = pieces[2].slice(1);
        if (pieces[3] === 'observation') {
          if (pieces[4] === 'create') {
            try {
              var record = JSON.parse(ewd.query.ewd_body);
              var observations = new ewd.mumps.GlobalNode('FHIR', [patientId]);
              var recordId = observations.$('count')._increment() - 1;
              observations.$('data').$(recordId)._setDocument(record);
              return {id: recordId};
            }
            catch(err) {
              return {error: 'Body is invalid JSON: ' + ewd.query.ewd_body}
            }
          }
          else {
            return getObservations(ewd.query.rest_url, patientId, ewd); 
          }
        }
      }
    }
    else {
      return {
        error: 'Invalid Authorization'
      };
    }
  }
};