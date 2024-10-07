// Load the API client and auth library
function loadGoogleSheetsApi() {
    gapi.load('client:auth2', initGoogleClient);
}

function initGoogleClient() {
    gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with your actual API key
        clientId: 'YOUR_CLIENT_ID', // Replace with your actual Client ID
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function () {
        console.log("Google API Client Initialized.");
    }).catch(function (error) {
        console.error("Error initializing Google API Client", error);
    });
}

// Extract Spreadsheet ID from URL
function extractSpreadsheetId(sheetUrl) {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = sheetUrl.match(regex);
    if (match) {
        return match[1];
    } else {
        throw new Error("Invalid Google Sheets URL");
    }
}

// Function to generate random product key
function generateProductKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let productKey = "";
    for (let i = 0; i < 4; i++) {
        productKey += [...Array(4)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('') + "-";
    }
    return productKey.slice(0, -1);  // Remove trailing '-'
}

// Store product keys in Google Sheets
async function storeProductKeys(spreadsheetId, numKeys) {
    const productKeys = [];
    for (let i = 0; i < numKeys; i++) {
        productKeys.push([generateProductKey(), "unused"]);
    }

    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1',  // Change the sheet name if necessary
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: productKeys
        }
    };

    try {
        const response = await gapi.client.sheets.spreadsheets.values.append(request);
        console.log(`${numKeys} Product Keys generated and stored successfully.`);
        document.getElementById("output").innerText = `${numKeys} Product Keys generated and stored successfully.`;
    } catch (error) {
        console.error("Error storing product keys", error);
        document.getElementById("output").innerText = "Error storing product keys.";
    }
}

// Validate product key
async function validateProductKey(spreadsheetId, productKey) {
    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:B'  // Adjust the sheet range
    };

    try {
        const response = await gapi.client.sheets.spreadsheets.values.get(request);
        const rows = response.result.values || [];

        const keyRow = rows.find(row => row[0] === productKey && row[1] === 'unused');
        if (keyRow) {
            const username = generateUsername();
            const password = generatePassword();
            keyRow[1] = 'used';

            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: `Sheet1!B${rows.indexOf(keyRow) + 1}:C${rows.indexOf(keyRow) + 1}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [['used', username, password]]
                }
            });

            console.log(`Product key ${productKey} is valid. Assigned credentials: ${username}, ${password}`);
            document.getElementById("output").innerText = `Product key is valid. Username: ${username}, Password: ${password}`;
        } else {
            console.log("Invalid or already used product key.");
            document.getElementById("output").innerText = "Invalid or already used product key.";
        }
    } catch (error) {
        console.error("Error validating product key", error);
        document.getElementById("output").innerText = "Error validating product key.";
    }
}

// Generate random username
function generateUsername() {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return [...Array(8)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Generate random password
function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return [...Array(10)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Event listeners for button actions
document.getElementById("generateKeysBtn").addEventListener("click", () => {
    const sheetUrl = document.getElementById("sheetUrl").value;
    const numKeys = parseInt(document.getElementById("numKeys").value);

    try {
        const spreadsheetId = extractSpreadsheetId(sheetUrl);
        storeProductKeys(spreadsheetId, numKeys);
    } catch (error) {
        console.error(error);
        document.getElementById("output").innerText = error.message;
    }
});

document.getElementById("validateKeyBtn").addEventListener("click", () => {
    const sheetUrl = document.getElementById("sheetUrl").value;
    const productKey = document.getElementById("productKey").value;

    try {
        const spreadsheetId = extractSpreadsheetId(sheetUrl);
        validateProductKey(spreadsheetId, productKey);
    } catch (error) {
        console.error(error);
        document.getElementById("output").innerText = error.message;
    }
});

// Initialize Google Sheets API
loadGoogleSheetsApi();
