var localForage = require('localforage');
var SlimSelect = require('slim-select');
var CanvasController = require('./canvas-controller');
var log = require('./helpers/log');


// Create new canvas controller
let canvasController = CanvasController('.canvas-controller');

let generateButton = document.querySelector( '.generate-button' );
let clearButton = document.querySelector( '.clear-button' );
let descriptionField = document.querySelector( '.description' );

// Removes src attribute from print description for better display
function stripDesc(desc) {
    let strippedDesc = { ...desc , photo: { ...desc.photo }};
    strippedDesc.photo.src = undefined;
    return strippedDesc;
}

// Initialize select field for saved print descriptions
new SlimSelect({
    select: '.saved-descriptions',
    // placeholder: 'Choose From Saved Descriptions',
    ajax: async function(search, callback) {
        try {
            // Search for the image name in the saved print descriptions
            // If search is empty return all results
            let photos = await localForage.keys();
            let filtered = photos.filter((p) => (p.indexOf(search) !== -1 || search === '') );
            let results = filtered.map((name) => {
                return {
                    text: name
                };
            });
            callback(results);
        } catch (e) {
            callback(false);
        }
    },
    onChange: function({ text }) {
        localForage.getItem(text).then((desc) => {
            canvasController.applyPrintDescription(desc);

            let strippedDesc = stripDesc(desc);
            descriptionField.value = JSON.stringify(strippedDesc, null, 4);
        });
    }
});

// Generates print description for a photo and saves it locally in the browser
generateButton.onclick = function( e ) {
    let printDescription = canvasController.getPrintDescription();
    if (!printDescription) {
        return;
    }

    localForage.setItem(printDescription.photo.id, printDescription);
    log(`Saved description of <b>${printDescription.photo.id}</b>`);
    
    // Display description to user
    let strippedDesc = stripDesc(printDescription);
    descriptionField.value = JSON.stringify(strippedDesc, null, 4);
};

// Clears all the previously stored print description
clearButton.onclick = function( e ) {
    localForage.clear().then(() => {
        log('Cleared all descriptions');
    });
}
log( "Test application ready" );