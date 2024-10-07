// Replace with your Google Sheet ID and range
const SPREADSHEET_ID = '1znAiF_PvV9p0aV4cOIk4PmCtgtyNJTmQWwSdoEuWLbg';
const SHEET_NAME = 'Sheet1';
const CLIENT_ID = '436073560587-c1tv96kj6h7agmfujq41gvnavd08s4sh.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY'; // replace with your API key
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function onGapiLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Handle the initial sign-in state
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const values = [
        [name, email]
    ];

    const body = {
        values: values
    };

    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:B`,
        valueInputOption: 'RAW',
        resource: body
    }).then((response) => {
        console.log(`${response.result.updates.updatedCells} cells appended.`);
        alert('Data submitted successfully!');
    }, (error) => {
        console.error('Error: ', error.result.error.message);
    });
}

// Load the Google API client library
gapi.load('client:auth2', onGapiLoad);
