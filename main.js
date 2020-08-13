var clientId =
  "173437994395-37f2altagfva3rovf6969s5pn5a9juob.apps.googleusercontent.com";
var apiKey = "AIzaSyAjJh97OmqCGjY7adqnDk0hWxIwY5RRib4";
var scopes = "https://www.googleapis.com/auth/contacts.readonly";


function authClick() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(authorize);
}

function authorize() {
  gapi.auth.authorize(
    { client_id: clientId, scope: scopes, immediate: false },
    authResult
  );
}
$(document).ready( function () {
  $('#myTable').DataTable();
} );
/**
 * Handle response from authorization server.
 * @param {Object} authResult Authorization result.
 */
function authResult(_Result) {
  var _Div = document.getElementById("divauthresult");
  
  if (_Result && !_Result.error) {
    $.get(
      "https://www.google.com/m8/feeds/contacts/default/thin?alt=json&access_token=" +
        _Result.access_token +
        "&max-results=500&v=3.0",
      function loadPeopleApi() {
        gapi.client.load(
          "https://people.googleapis.com/$discovery/rest",
          "v1",
          showContacts
        );
      }
    );
  } else {
    // Auth Error, allowing the user to initiate authorization by
    _Div.innerText = ":( Authtentication Error : " + _Result.error;
  }
}

/**
 * Load Google People client library. List Contact requested info
 */

/**
 * Show Contacts Details display on a table pagesize = 100 connections.
 */
function showContacts() {
  var request = gapi.client.people.people.connections.list({
    resourceName: "people/me",
    pageSize: 500,
    "requestMask.includeField":
      "person.phone_numbers,person.organizations,person.email_addresses,person.names",
  });

  request.execute(function (resp) {
    if (typeof resp.connections !== "undefined") {
      var connections = [resp.connections][0];
      if (connections.length > 0) {
        var _Html =
          "<table class='table table-striped table-bordered' style='width:100%'><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th></tr>";
        var _EmptyCell = "<td id='example'> - </td>";
        
        console.log('connections', connections);
        var contactsData = new Array();
        
        for (i = 0; i < connections.length; i++) {
          var person = [connections[i]][0];
          var individial = {};
          _Html += "<tr>";

          if (person.names && person.names.length > 0){
            individial['name'] = person.names[0].displayName;
            _Html += "<td>" + person.names[0].displayName + "</td>";
          }
          else _Html += _EmptyCell;

          if (person.emailAddresses && person.emailAddresses.length > 0){
            individial['email'] = person.emailAddresses[0].value;
            _Html += "<td>" + person.emailAddresses[0].value + "</td>";
          }
          else _Html += _EmptyCell;

          if (person.organizations && person.organizations.length > 0){
          individial['organisation'] = person.organizations[0].name;
            _Html += "<td>" + person.organizations[0].name + "</td>";
          }
          else _Html += _EmptyCell;

          if (person.phoneNumbers && person.phoneNumbers.length > 0){
            individial['phone_number'] = person.phoneNumbers[0].value;
            _Html += "<td>" + person.phoneNumbers[0].value + "</td>";
          }
          else _Html += _EmptyCell;

          _Html += "</tr>";
          contactsData.push(individial);
        }
        divtableresult.innerHTML = "Contacts found : <br>" + _Html;
        saveContactInJsonFile(contactsData);
        
      } else {
        divtableresult.innerHTML = "";
        divauthresult.innerText = "No Contacts found!";
      }
    } else {
      divtableresult.innerHTML = "";
      divauthresult.innerText = "No Contacts found!";
    }
  });
}

function saveContactInJsonFile(contacts){
    
    $('#loadJson').on('click',function(e){
        if(contacts)
            saveData(contacts, 'data.json');
    });
}


var saveData = (function () { 
    var a = document.createElement("a"); 
    document.body.appendChild(a); 
    a.style = "display: none"; 
    return function (data, fileName) { 
        var json = JSON.stringify(data), 
            blob = new Blob([json], {type: "octet/stream"}), 
            url = window.URL.createObjectURL(blob); 
        a.href = url; 
        a.download = fileName; 
        a.click(); 
        window.URL.revokeObjectURL(url); 
    }; 
}());

