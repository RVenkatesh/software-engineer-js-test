var localForage = require('localforage');
var SlimSelect = require('slim-select');
var CanvasController = require('./canvas-controller');
var log = require('./log');

function stripDesc(desc) {
    let strippedDesc = { ...desc , photo: { ...desc.photo }};
    strippedDesc.photo.src = undefined;
    return strippedDesc;
}

// Create new canvas controller
let canvasController = CanvasController('.canvas-controller');

let generateButton = document.querySelector( '.generate-button' );
let clearButton = document.querySelector( '.clear-button' );
let descriptionField = document.querySelector( '.description' );

// Initialize select field for saved print descriptions
new SlimSelect({
    select: '.saved-descriptions',
    // placeholder: 'Choose From Saved Descriptions',
    ajax: async function(search, callback) {
        if (!search.trim()) {
            callback(false);
            return;
        }
        let photos = await localForage.keys();
        let filtered = photos.filter((p) => p.indexOf(search) !== -1 );
        let results = filtered.map((name) => {
            return {
                text: name
            };
        });
        // Temporary fix for slim select
        // results = [ {'placeholder': true, 'text': 'Choose From Saved Descriptions'}, ...results ];
        callback(results);
    },
    onChange: function({ text }) {
        localForage.getItem(text).then((desc) => {
            canvasController.applyPrintDescription(desc);

            let strippedDesc = stripDesc(desc);
            descriptionField.value = JSON.stringify(strippedDesc, null, 4);
        });
    }
});

generateButton.onclick = function( e ) {
    let printDescription = canvasController.getPrintDescription();
    if (!printDescription) {
        return;
    }

    localForage.setItem(printDescription.photo.id, printDescription);
    log(`Saved description of ${printDescription.photo.id}`);
    
    // Display description to user
    let strippedDesc = stripDesc(printDescription);
    descriptionField.value = JSON.stringify(strippedDesc, null, 4);
};

clearButton.onclick = function( e ) {
    localForage.clear().then(() => {
        log('Cleared all descriptions');
    });
}
log( "Test application ready" );