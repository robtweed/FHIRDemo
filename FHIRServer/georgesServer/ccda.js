var getValues = function(td, map, values) {
  var colNo;
  var row = {};
  for (colNo = 0; colNo < map.length; colNo++) {
    if (map[colNo].type === 'date') {
      if (map[colNo].encodeUnless) {
        if (td[colNo] !== map[colNo].encodeUnless) td[colNo] = new Date(td[colNo]);
      }
      else {
        td[colNo] = new Date(td[colNo]);
      }
    }
    row[map[colNo].label] = td[colNo];
  }
  values.push(row);
  return values;
};

var parseDate = function(date) {
  if (date === '') return '';
  date = date.toString();
  var year = date.substr(0,4);
  var month = date.substr(4,2);
  var day = date.substr(6,2);
  return new Date(month + '/' + day + '/' + year);
};

var getHeading = function(params, ewd) {
    var subscripts = [params.patientId];
    if (params.type === 'ccda') subscripts = ['data', params.patientId]
    var ccda = new ewd.mumps.GlobalNode(params.type, subscripts);
    var component = ccda.$('component').$('structuredBody').$('component');
    var values = [];
    var map = params.map;
    var sortBy = params.sortBy;
    component._forEach(function(key, node) {
      //if (node.$('section').$('title')._value === params.heading) {
      console.log(params.heading + '; code = ' + params.code)
      console.log( 'ccda section code: ' + node.$('section').$('code').$('code')._value);
      if (node.$('section').$('code').$('code')._value === params.code) {
        console.log("code match!");
        var td;
        var table = node.section.$('text').$('table').$('tbody').$('tr');
        if (table._first === 'td') {
          td = table.$('td')._getDocument();
          values = getValues(td, map, values);
        }
        else {
          table._forEach(function(key, node) {
            td = node._getDocument();
            values = getValues(td.td, map, values);
          });
        }
        return true;
      }
    });
    // sort in reverse chronological order - most recent first
    values.sort(function(a, b) {
      return b[sortBy] - a[sortBy];
    });
    return values;
};

var EWD = {};

module.exports = {

  pathTest: function(ewd) {
    var node = matchPath('ccda', '//templateId/root', '2.16.840.1.113883.10.20.22.2.5.1', ewd);
    return node;
  },

  getLatestValues: function(valueArray, dateField, allDay) {
    var latestValues = [];
    var firstRecord = valueArray[0];
    latestValues.push(firstRecord);
    var date;
    if (allDay) {
      date = firstRecord[dateField].toDateString();
    }
    else {
      date = firstRecord[dateField].toString();
    }
    var record;
    var date2;
    for (var i = 1; i < valueArray.length; i++) {
      record = valueArray[i];
      if (allDay) {
        date2 = record[dateField].toDateString();
      }
      else {
        date2 = record[dateField].toString();
      }
      if (date2 === date) {
        latestValues.push(record);
      }
      else {
        break;
      }
   }
   return latestValues;
  },

  getAllergies: function(type, patientId, ewd) {

    var parseEntries = function(entry) {
      var data = [];
      if (entry.$(0)._exists) {
        entry._forEach(function(no, node) {
          parseEntry(node, data);
        });
        data.sort(function(a, b) {
          return b['date_range']['start'] - a['date_range']['start'];
        });
      }
      else {
        parseEntry(entry, data);
      }
      return data;
    }; 

    var parseEntry = function(node, data) {
        var act = node.$('act');
        var el = act.$('effectiveTime');
        var start_date = el.$('low').$('value')._value;
        var end_date = el.$('high').$('value')._value;
        var observation = act.$('entryRelationship').$('observation');
        var root = observation.$('templateId').$('root')._value;
        var name = '';
        var code = '';
        var code_system = '';
        var code_system_name = '';
        var reaction_type_name = '';
        var reaction_type_code = '';
        var reaction_type_code_system = '';
        var reaction_type_code_system_name = '';
        var reaction_name = '';
        var reaction_code = '';
        var reaction_code_system = '';
        var severity = '';
        var status = '';
        var allergen_name = '';
        var allergen_code = '';
        var allergen_code_system = '';
        var allergen_code_system_name = '';
        var codeNode;
        if (root === '2.16.840.1.113883.10.20.22.4.7') {
          codeNode = observation.$('code');
          name = codeNode.$('displayName')._value;
          code = codeNode.$('code')._value;
          code_system = codeNode.$('codeSystem')._value;
          code_system_name = codeNode.$('codeSystemName')._value;
          var value = observation.$('value');
          reaction_type_name = value.$('displayName')._value;
          reaction_type_code = value.$('code')._value;
          reaction_type_code_system = value.$('codeSystem')._value;
          reaction_type_code_system_name = value.$('codeSystemName')._value;
        }
        var rels = observation.$('entryRelationship');
        rels._forEach(function(no, node) {
          var observation = node.$('observation');
          var root = observation.$('templateId').$('root')._value;
          var value = observation.$('value');
          if (root === '2.16.840.1.113883.10.20.22.4.9') {
            reaction_name = value.$('displayName')._value;
            reaction_code = value.$('code')._value;
            reaction_code_system = value.$('codeSystem')._value;
          }
          if (root === '2.16.840.1.113883.10.20.22.4.8') {
            severity = value.$('displayName')._value;
          }
          if (root === '2.16.840.1.113883.10.20.22.4.28') {
            status = value.$('displayName')._value;
          }
        });
        codeNode = observation.$('participant').$('participantRole').$('playingEntity').$('code');
        allergen_name = codeNode.$('displayName')._value;
        allergen_code = codeNode.$('code')._value;
        allergen_code_system = codeNode.$('codeSystem')._value;
        allergen_code_system_name = codeNode.$('codeSystemName')._value;

        if (allergen_name === '' && allergen_code === '') {
          var translation = codeNode.$('translation');
          allergen_name = translation.$('displayName')._value;
          allergen_code = translation.$('code')._value;
          allergen_code_system = translation.$('codeSystem')._value;
          allergen_code_system_name = translation.$('codeSystemName')._value;
        }

        data.push({
          date_range: {
            start: parseDate(start_date),
            end: parseDate(end_date)
          },
          name: name,
          code: code,
          code_system: code_system,
          code_system_name: code_system_name,
          status: status,
          severity: severity,
          reaction: {
            name: reaction_name,
            code: reaction_code,
            code_system: reaction_code_system
          },
          reaction_type: {
            name: reaction_type_name,
            code: reaction_type_code,
            code_system: reaction_type_code_system,
            code_system_name: reaction_type_code_system_name
          },
          allergen: {
            name: allergen_name,
            code: allergen_code,
            code_system: allergen_code_system,
            code_system_name: allergen_code_system_name
          }
        });
    };

    var subscripts = [patientId];
    if (type === 'ccda') subscripts = ['data', patientId]
    var ccda = new ewd.mumps.GlobalNode(type, subscripts);
    var component = ccda.$('component').$('structuredBody').$('component');
    var entry;
    var allergies = [];
    component._forEach(function(no, node) {
      var section = node.$('section');
      if (section.$('templateId').$('root')._value === '2.16.840.1.113883.10.20.22.2.6.1') {
        allergies = parseEntries(section.$('entry'));
        return true; // stop forEach loop
      }
    });
    return allergies;
  },

  getSocialHistory: function(type, patientId, ewd) {
    var params = {
      type: type,
      patientId: patientId,
      heading: 'Social History',
      code: '29762-2',
      sortBy: 'startDate',
      map: [
        {label: 'startDate', type: 'date'},
        {label: 'endDate', type: 'date', encodeUnless: 'not available'},
        {label: 'type'},
        {label: 'comments'},
        {label: 'source'}
      ]
    };
    return getHeading(params, ewd);
  },

  getMedications: function(type, patientId, ewd) {
    /*
    var params = {
      type: type,
      patientId: patientId,
      heading: 'Medications',
      code: '10160-0',
      sortBy: 'date',
      map: [
        {label: 'date', type: 'date'},
        {label: 'medication'},
        {label: 'dose'},
        {label: 'form'},
        {label: 'route'},
        {label: 'frequency'},
        {label: 'directions'},
        {label: 'status'},
        {label: 'source'}
      ]
    };
    return getHeading(params, ewd);
    */

    var parseEntries = function(entry) {
      var data = [];
      if (entry.$(0)._exists) {
        entry._forEach(function(no, node) {
          parseEntry(node, data);
        });
        data.sort(function(a, b) {
          return b['date_range']['start'] - a['date_range']['start'];
        });
      }
      else {
        parseEntry(entry, data);
      }
      return data;
    }; 

    var parseEntry = function(node, data) {
        var sAdmin = node.$('substanceAdministration');
        var el = sAdmin.$('effectiveTime');
        var start_date;
        var end_date;
        if (el.$(0)._exists) {
          el._forEach(function(no, node) {
            if (node.$('high')._exists) {
              start_date = node.$('low').$('value')._value;
              end_date = node.$('high').$('value')._value;
              return true;
            }
          });
        }
        else {
          start_date = el.$('low').$('value')._value;
          end_date = el.$('high').$('value')._value;
        }
        var product_name = '';
        var product_code = '';
        var product_code_system = '';
        var translation_name = '';
        var translation_code = '';
        var translation_code_system = '';
        var translation_code_system_name = '';
        var dose_value = '';
        var dose_unit = '';
        var rate_quantity_value = '';
        var rate_quantity_unit = '';
        var precondition_name = '';
        var precondition_code = '';
        var precondition_code_system = '';
        var reason_name = '';
        var reason_code = '';
        var reason_code_system = '';
        var route_name = '';
        var route_code = '';
        var route_code_system = '';
        var route_code_system_name = '';
        var vehicle_name = '';
        var vehicle_code = '';
        var vehicle_code_system = '';
        var vehicle_code_system_name = '';
        var administration_name = '';
        var administration_code = '';
        var administration_code_system = '';
        var administration_code_system_name = '';
        var prescriber_organization = '';
        var prescriber_person = '';

        var codeNode = sAdmin.$('consumable').$('manufacturedProduct').$('manufacturedMaterial').$('code');
        product_name = codeNode.$('displayName')._value;
        product_code = codeNode.$('code')._value;
        product_code_system = codeNode.$('codeSystem')._value;
        var translation = codeNode.$('translation');
        translation_name = translation.$('displayName')._value;
        translation_code = translation.$('code')._value;
        translation_code_system = translation.$('codeSystem')._value;
        translation_code_system_name = translation.$('codeSystemName')._value;
        var quantity = sAdmin.$('doseQuantity');
        dose_value = quantity.$('value')._value;
        dose_unit = quantity.$('unit')._value;
        quantity = sAdmin.$('rateQuantity');
        rate_quantity_value = quantity.$('value')._value;
        rate_quantity_unit = quantity.$('unit')._value;
        var value = sAdmin.$('precondition').$('criterion').$('value');
        precondition_name = value.$('displayName')._value;
        precondition_code = value.$('code')._value;
        precondition_code_system = value.$('codeSystem')._value;
        var routeCode = sAdmin.$('routeCode');
        route_name = routeCode.$('displayName')._value;
        route_code = routeCode.$('code')._value;
        route_code_system = routeCode.$('codeSystem')._value;
        route_code_system_name = routeCode.$('codeSystemName')._value;
        var codeNode = sAdmin.$('participant').$('participantRole').$('playingEntity').$('code');
        vehicle_name = codeNode.$('displayName')._value;
        vehicle_code = codeNode.$('code')._value;
        vehicle_code_system = codeNode.$('codeSystem')._value;
        vehicle_code_system_name = codeNode.$('codeSystemName')._value;
        var codeNode = sAdmin.$('administrationUnitCode');
        administration_name = codeNode.$('displayName')._value;
        administration_code = codeNode.$('code')._value;
        administration_code_system = codeNode.$('codeSystem')._value;
        administration_code_system_name = codeNode.$('codeSystemName')._value;
        prescriber_organization = sAdmin.$('performer').$('assignedEntity').$('representedOrganization').$('name')._value;
        //prescriber_person = null;

        var rels = sAdmin.$('entryRelationship');
        rels._forEach(function(no, node) {
          var observation = node.$('observation');
          var root = observation.$('templateId').$('root')._value;
          var value = observation.$('value');
          if (root === '2.16.840.1.113883.10.20.22.4.19') {
            reason_name = value.$('displayName')._value;
            reason_code = value.$('code')._value;
            reason_code_system = value.$('codeSystem')._value;
            return true; // stop the forEach loop
          }
        });

      data.push({
        date_range: {
          start: parseDate(start_date),
          end: parseDate(end_date)
        },
        product: {
          name: product_name,
          code: product_code,
          code_system: product_code_system,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          }
        },
        dose_quantity: {
          value: dose_value,
          unit: dose_unit
        },
        rate_quantity: {
          value: rate_quantity_value,
          unit: rate_quantity_unit
        },
        precondition: {
          name: precondition_name,
          code: precondition_code,
          code_system: precondition_code_system
        },
        reason: {
          name: reason_name,
          code: reason_code,
          code_system: reason_code_system
        },
        route: {
          name: route_name,
          code: route_code,
          code_system: route_code_system,
          code_system_name: route_code_system_name
        },
        vehicle: {
          name: vehicle_name,
          code: vehicle_code,
          code_system: vehicle_code_system,
          code_system_name: vehicle_code_system_name
        },
        administration: {
          name: administration_name,
          code: administration_code,
          code_system: administration_code_system,
          code_system_name: administration_code_system_name
        },
        prescriber: {
          organization: prescriber_organization,
          person: prescriber_person
        }
      });
    };


    var subscripts = [patientId];
    if (type === 'ccda') subscripts = ['data', patientId]
    var ccda = new ewd.mumps.GlobalNode(type, subscripts);
    var component = ccda.$('component').$('structuredBody').$('component');
    var entry;
    var medications = [];
    component._forEach(function(no, node) {
      var section = node.$('section');
      if (section.$('templateId').$('root')._value === '2.16.840.1.113883.10.20.22.2.1.1') {
        medications = parseEntries(section.$('entry'));
        return true; // stop forEach loop
      }
    });
    return medications;

  },

  getProblems: function(type, patientId, ewd) {

    var parseEntries = function(entry) {
      var data = [];
      if (entry.$(0)._exists) {
        entry._forEach(function(no, node) {
          parseEntry(node, data);
        });
        data.sort(function(a, b) {
          return b['date_range']['start'] - a['date_range']['start'];
        });
      }
      else {
        parseEntry(entry, data);
      }
      return data;
    }; 

    var parseEntry = function(node, data) {
        var act = node.$('act');
        var el = act.$('effectiveTime');
        var start_date = el.$('low').$('value')._value;
        var end_date = el.$('high').$('value')._value;
        var observation = act.$('entryRelationship').$('observation');
        var value = observation.$('value');
        var name = value.$('displayName')._value;
        var code = value.$('code')._value;
        var code_system = value.$('codeSystem')._value;
        var status = '';
        var age = '';
        var rels = observation.$('entryRelationship');
        rels._forEach(function(no, node) {
          var observation = node.$('observation');
          var root = observation.$('templateId').$('root')._value;
          if (root === '2.16.840.1.113883.10.20.22.4.6') {
            status = observation.$('value').$('displayName')._value;
          }
          if (root === '2.16.840.1.113883.10.20.22.4.31') {
            age = observation.$('value').$('value')._value;
            age = parseFloat(age);
          }
        });
        data.push({
          date_range: {
            start: parseDate(start_date),
            end: parseDate(end_date)
          },
          name: name,
          status: status,
          age: age,
          code: code,
          code_system: code_system
        });
    };

    var subscripts = [patientId];
    if (type === 'ccda') subscripts = ['data', patientId]
    var ccda = new ewd.mumps.GlobalNode(type, subscripts);
    var component = ccda.$('component').$('structuredBody').$('component');
    var found = false;
    var entry;
    var problems = [];
    component._forEach(function(no, node) {
      var section = node.$('section');
      if (section.$('templateId').$('root')._value === '2.16.840.1.113883.10.20.22.2.5.1') {
        found = true;
        problems = parseEntries(section.$('entry'));
        return true;
      }
    });
    if (!found) {
      component._forEach(function(no, node) {
        var section = node.$('section');
        if (section.$('templateId').$('root')._value === '2.16.840.1.113883.10.20.22.2.5') {
          problems = parseEntries(section.$('entry'));
          return true;
        }
      });
    }
    return problems;
  },

  getLabs: function(type, patientId, ewd) {
    var params = {
      type: type,
      patientId: patientId,
      heading: 'Lab Results',
      code: '30954-2',
      sortBy: 'date',
      map: [
        {label: 'date', type: 'date'},
        {label: 'test'},
        {label: 'value'},
        {label: 'range'},
        {label: 'abnormal'},
        {label: 'comments'},
        {label: 'provider'}
      ]
    };
    return getHeading(params, ewd);
  },

  getVitals: function(type, patientId, ewd) {
    /*
    var params = {
      type: type,
      patientId: patientId,
      heading: 'Vital Signs',
      code: '8716-3',
      sortBy: 'date',
      map: [
        {label: 'date', type: 'date'},
        {label: 'vitalSign'},
        {label: 'value'},
        {label: 'details'},
        {label: 'source'}
      ]
    };
    return getHeading(params, ewd);
    */

    var parseEntries = function(entry) {
      var data = [];
      EWD.count = 0;
      if (entry.$(0)._exists) {
        entry._forEach(function(no, node) {
          parseEntry(node, data);
          if (EWD.count > 10) return true;
        });
        data.sort(function(a, b) {
          return b['date'] - a['date'];
        });
      }
      else {
        parseEntry(entry, data);
      }
      return data;
    }; 

    var parseEntry = function(node, data) {
        var organizer = node.$('organizer');
        var el = organizer.$('effectiveTime');
        var entry_date = el.$('value')._value;
        var components = organizer.$('component');
        if (components._exists) {
          var results_data = [];
          components._forEach(function(no, node) {
            var observation = node.$('observation');
            var codeNode = observation.$('code');
            var name = codeNode.$('displayName')._value;
            var code = codeNode.$('code')._value;  
            var code_system = codeNode.$('codeSystem')._value;  
            var code_system_name = codeNode.$('codeSystemName')._value;
            var valueNode = observation.$('value');
            var unit = valueNode.$('unit')._value;
            var value = valueNode.$('value')._value;
            var status = observation.$('statusCode').$('code')._value;
            var id = observation.$('id').$('root')._value;
            results_data.push({
              name: name,
              code: code,
              code_system: code_system,
              code_system_name: code_system_name,
              value: value,
              unit: unit,
              status: status,
              id: id
            });
            if (code === '8480-6' || code === '8462-4') {
              EWD.count++;
              if (EWD.count > 10) return true;
            }
          });
          data.push({
            date: parseDate(entry_date),
            results: results_data
          });
        }
    };

    var subscripts = [patientId];
    if (type === 'ccda') subscripts = ['data', patientId]
    var ccda = new ewd.mumps.GlobalNode(type, subscripts);
    var component = ccda.$('component').$('structuredBody').$('component');
    var entry;
    var vitals = [];
    component._forEach(function(no, node) {
      var section = node.$('section');
      var rootCode = section.$('templateId').$('root')._value;
      if (rootCode === '2.16.840.1.113883.10.20.22.2.4.1' || rootCode === '2.16.840.1.113883.10.20.22.2.4') {
        vitals = parseEntries(section.$('entry'));
        return true; // stop forEach loop
      }
    });
    //console.log("*!*!**! vitals: " + JSON.stringify(vitals, null, 2));
    return vitals;
  },

  getDemographics: function(type, patientId, ewd) {
    var ccda = new ewd.mumps.GlobalNode(type, [patientId, 'recordTarget', 'patientRole']);
    var demographics = {};
    demographics.address = ccda.$('addr')._getDocument();
    var patient = ccda.$('patient')._getDocument();
    demographics.gender = patient.administrativeGenderCode.code;
    demographics.dob = patient.birthTime.value;
    demographics.ethnicGroup = patient.ethnicGroupCode.displayName;
    demographics.race = patient.raceCode.displayName;
    demographics.name = patient.name;
    demographics.maritalStatus = patient.maritalStatusCode.displayName;
    demographics.religion = patient.religiousAffiliationCode.displayName;
    return demographics;
  }

};