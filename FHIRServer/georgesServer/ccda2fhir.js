module.exports = {

  observation: function(ccdaVitals, url) {
    var obs = this.vitals(ccdaVitals);
    var entries = [];
    var observation;
    var components;
    var component;
    var entry;
    var j;
    var totalResults = 0;
    //for (var i = 0; i < obs.length; i++) {
    for (var i = 0; i < 5; i++) {
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
  },

  vitals: function(ccdaVitals) {

    var createObs = function() {
      return {
        resourceType: 'Observation',
        name: {
          coding: [{
            system: 'http://loinc.org',
            code: ''
          }]
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
        appliesDateTime: '',
        component: []
      };
    };
      
    var vital;
    var result;
    var resNo;
    var record = {}
    var found;
    var use;
    var obs;
    var code;
    var observations = [];
    var compRec;
    var lookup = {};
    lookup['8480-6'] = 'Systolic Blood Pressure';
    lookup['8462-4'] = 'Diastolic Blood Pressure';
    for (var i = 0; i < ccdaVitals.length; i++) {
      vital = ccdaVitals[i];
      found = {};
      use = false;
      for (resNo = 0; resNo < vital.results.length; resNo++) {
        result = vital.results[resNo];
        if (result.code === '8480-6' || result.code === '8462-4') {
          found[result.code] = resNo;
          use = true;
        }        
      }
      if (use) {
        // CCDA Vitals record contains blood pressure reading
        obs = createObs();
        //console.log(i + ': ' + JSON.stringify(obs));
        obs.appliesDateTime = vital.date;
        obs.status = '';
        obs.identifier = {
          system: 'urn:ietf:rfc:3986',
          value: ''
        };
        for (code in found) {
          resNo = found[code];
          result = vital.results[resNo];
          obs.status = result.status;
          obs.identifier.value = result.id; 
          compRec = {
            valueCodeableConcept: {
              coding: []
            },
            valueQuantity: {
              value: result.value,
              units: result.unit
            },
            name: {
              coding: [{
                system: "http://loinc.org",
                code: code,
                display: lookup[code]
              }]
            }
          };
          obs.component.push(compRec);
        }
      }
      observations.push(obs);
    }
    return observations;
  }

};
