  var sysArray1 = []; 
  var diaArray1 = [];
  var sysArray2 = [];
  var diaArray2 = [];
  var sysLine = [];
  var diaLine = [];
  var timeHash = [];
  var newSysLine = [];
  var newDiaLine = [];
  var vistaLoaded = false;
  var patientLoaded = false;
  var vistAData = [];
  var patientData = [];

EWD.application = {
  name: 'FHIRDemo',
  login: true,
  labels: {
    'ewd-title': 'Vista Novo',
    'ewd-loginPanel-title': 'VistA Novo Demonstration',
    'ewd-navbar-title-phone': 'VistA Novo',
    'ewd-navbar-title-other': 'VistA Novo using EWD.js on FHIR',
    'ewd-menu-title': 'Menu',
  },
  menuOptions: [

  ],

  messageHandlers: function(messageObj) {

    if (messageObj.type === 'readyToGo') {
      btnEvents();
      vistaLoaded = false;
      patientLoaded = false;
      EWD.sockets.sendMessage({
        type: 'getBPData'
      });
    }

    if (messageObj.type === 'vistAData') {
      //console.log('received: ' + JSON.stringify(messageObj.observations));
      var observations = messageObj.observations;
      var entries = observations.entry;
      var entry;
      var component;
      var j;
      vistAData = [];
      var record;
      for (var i = 0; i < entries.length; i++) {
        entry = entries[i];
        console.log('entry ' + i + ': ' + JSON.stringify(entry));
        var date = new Date(entry.content.appliesDateTime);
        record = {date: date};
        components = entry.content.component;
        for (j = 0; j < components.length; j++) {
          component = components[j];
          //console.log('component ' + j + ': ' + JSON.stringify(component));
          if (component.name.coding[0].code === '8480-6') {
            record.systolic = component.valueQuantity.value;
          }
          if (component.name.coding[0].code === '8462-4') {
            record.diastolic = component.valueQuantity.value;
          }
        }
        //console.log('record: ' + JSON.stringify(record));
        vistAData.push(record);
      }
      //console.log('vistAData: ' + JSON.stringify(vistAData));
      vistaLoaded = true;
      goGraph();
    }

    if (messageObj.type === 'patientData') {
      //console.log('received: ' + JSON.stringify(messageObj.observations));
      var observations = messageObj.observations;
      var entries = observations.entry;
      var entry;
      var component;
      var j;
      patientData = [];
      var record;
      for (var i = 0; i < entries.length; i++) {
        entry = entries[i];
        console.log('entry ' + i + ': ' + JSON.stringify(entry));
        var date = new Date(entry.content.appliesDateTime);
        record = {date: date};
        components = entry.content.component;
        for (j = 0; j < components.length; j++) {
          component = components[j];
          //console.log('component ' + j + ': ' + JSON.stringify(component));
          if (component.name.coding[0].code === '8480-6') {
            record.systolic = component.valueQuantity.value;
          }
          if (component.name.coding[0].code === '8462-4') {
            record.diastolic = component.valueQuantity.value;
          }
        }
        //console.log('record: ' + JSON.stringify(record));
        patientData.push(record);
      }
      //console.log('vistAData: ' + JSON.stringify(vistAData));
      patientLoaded = true;
      goGraph();
    }
    
    if (messageObj.type === 'getUsers') {
    }
  }
};

var goGraph = function() {
  if (vistaLoaded && patientLoaded) {
      $('#graphContainer').collapse('show');
      displayGraph(vistAData, patientData);
      doGraph();
      vistaLoaded = false;
      patientLoaded = false;
  }
}

EWD.sockets.log = true;


function btnEvents() {
    $("#submitBpBtn").on('click', function() {
        console.log("clicked button");
        var sys = $("#sysInput").val();
        var dia = $("#diaInput").val();        
        var nowDate = new Date();
        newDiaLine.push([
           nowDate,
           dia 
        ]);       
        newSysLine.push([
           nowDate,
           sys 
        ]);
        diaArray2.push([
           nowDate,
           dia
        ]);        
        sysArray2.push([
           nowDate,
           sys
        ]);       
        var options = {
            xaxis: {
                mode: "time",
                tickLength: 5
            },
            selection: {
                mode: "x"
            }
        };
        plotTheGraph(options);   
        var obj = {
            date: nowDate,
            systolic: sys,
            diastolic: dia
        };
        EWD.sockets.sendMessage({
          type: 'newDataPoint',
          params: obj
       });
    });
};

var displayGraph = function(arr1, arr2) {
  //var arr1 = [];
  //var arr2 = [];
  var d;


  // build objects for graph from recieved objects



  // convert raw objects to individual plots for flot.
  function obj2plots(obj1, obj2) {
    for (var i = 0; i < obj1.length; i++){
        timeHash.push(obj1[i].date.getTime());
        sysLine.push( [obj1[i].date.getTime(), obj1[i].systolic] );
        diaLine.push( [obj1[i].date.getTime(), obj1[i].diastolic]);
        sysArray1.push( [obj1[i].date.getTime(), obj1[i].systolic] );
        diaArray1.push( [obj1[i].date.getTime(), obj1[i].diastolic] );
    }
    for (i = 0; i < obj2.length; i++) {
        sysLine.push([obj2[i].date.getTime(), obj2[i].systolic]);
        timeHash.push(obj2[i].date.getTime());
        diaLine.push([obj2[i].date.getTime(), obj2[i].diastolic]);
        sysArray2.push( [obj2[i].date.getTime(), obj2[i].systolic] );
        diaArray2.push( [obj2[i].date.getTime(), obj2[i].diastolic] );
    }

    //console.log(testLine);
    var sorted = timeHash.sort(function(a,b){
        return a - b;
    });

    //console.log(sorted);
    //console.log("...")
    //console.log(sorted);
    for (i = 0; i < sorted.length; i++) {
        for (var j = 0; j < sysLine.length; j++) {
            if (sorted[i] === sysLine[j][0]) {
                newSysLine[i] = [sorted[i],sysLine[j][1]]
            }
        }
    }
    for (i = 0; i < sorted.length; i++) {
        for (var j = 0; j < diaLine.length; j++) {
            if (sorted[i] === diaLine[j][0]) {
                newDiaLine[i] = [sorted[i],diaLine[j][1]]
            }
        }
    }

  };
  obj2plots(arr1,arr2);
};

// initially create the graph
function doGraph() {

    var options = {
        xaxis: {
            mode: "time",
            tickLength: 5
        },
        selection: {
            mode: "x"
        }
    };

    plotTheGraph(options);


    $("#demoContainr").append("Flot " + $.plot.version + " &ndash; ");

    window.onresize = function(event) { // resize listener for responsiveness
//        $.plot($("#placeholder"), [sysArray, diaArray], options);
        plotTheGraph(options);
    }
};

// plot/replot the graph

function plotTheGraph(options) {
    $.plot($("#placeholder"), [
        {
            data:sysArray1,
            lines: {show:false},
            points: {
                show:true,
                lineWidth: 0,
                fillColor: "rgba(0,255,0,1)"
            }
        },
        {
            data: diaArray1,
            lines: {show:false},
            points: {
                show:true,
                lineWidth: 0,
                fillColor: "rgba(0,255,0,1)"
            }
        }, 
        {
            data: sysArray2,
            lines: {show:false},
            points: {
                show:true,
                lineWidth: 0,
                fillColor: "rgba(255,0,0,1)"
            }
        }, 
        {
            data: diaArray2,
            lines: {show:false},
            points: {
                show:true,
                lineWidth: 0,
                fillColor: "rgba(255,0,0,1)"
            }
        },
        {
            data: newSysLine,
            lines: {
                show:true,
                fillColor: "rgba(0,0,0,1)"
            },
            points: {
                show:false
            }
        }, 
        {
            data: newDiaLine,
            lines: {
                show:true,
                fillColor: "rgba(0,0,0,1)"
            },
            points: {
                show:false
            }
        }
    ], options);
}