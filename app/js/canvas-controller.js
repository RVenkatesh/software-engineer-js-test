var PhotoCanvas = require('./photo-canvas');
var { imageGetter } = require('./utilities');
var log = require('./log');
var { InvalidDOMElementException } = require('./exceptions');

const CANVAS_WIDTH = 15,
    CANVAS_HEIGHT = 10;

function _bindControllerActions($root, canvas) {
    const MOVE_LIMIT = 0.1;
    // grab DOM elements inside index.html

    let fileSelector = $root.querySelector( '.file-selector' );
    let moveButtons = $root.querySelectorAll( '.move-button' );
    let scaleButtons = $root.querySelectorAll( '.scale-button' );

    // bind file input to image getter and wait for callback
    imageGetter(fileSelector, (src, id) => {
        var imageData = {
            id,
            src,
        };
        fileSelector.value = null;
        // add image to canvas
        canvas.updateImg(imageData, true);
    });
    moveButtons.forEach((moveButton) => {
        moveButton.onclick = function ( e ) {
            let dir = e.target.dataset.dir || 'LEFT';
            canvas.move(dir, MOVE_LIMIT);
        }
    });

    scaleButtons.forEach((scaleButton) => {
        scaleButton.onclick = function ( e ) {
            let value = parseFloat(e.target.dataset.value) || 0.5;
            canvas.scale(value);
        }
    });
}

function CanvasController($root) {
    if (typeof $root === 'string') {
        $root = document.querySelector($root);
    }
    if (!($root instanceof HTMLElement)) {
        let msg = `CanvasController needs a valid html element to be used as root`;
        log(msg, true);
        throw new InvalidDOMElementException(msg);
    }

    let photoCanvas;

    function _init() {
        /**
         * CREATE CANVAS AND ACTION BUTTONS IN THE DOM
         */
        // Insert canvas container
        let containerTemplate = document.getElementById('canvas-container');
        $canvasContainer = containerTemplate.content.firstElementChild.cloneNode(true);
        
        // Insert canvas actions
        let actionsTemplate = document.getElementById('canvas-actions');
        $canvasActions = actionsTemplate.content.firstElementChild.cloneNode(true);

        $root.appendChild($canvasContainer);
        $root.appendChild($canvasActions);
        

        /**
         * CREATE PhotoCanvas INSTANCE AND INSERT INTO THE DOM 
         */
        photoCanvas = PhotoCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        let $canvas = photoCanvas.getCanvas();
        let imageContainer = document.querySelector( '.canvas-container' );
        
        // add image to container
        while ( imageContainer.childNodes.length > 0 ) {
            imageContainer.removeChild( imageContainer.childNodes[ 0 ]);
        }
        imageContainer.appendChild( $canvas );

        // BIND ACTIONS TO THE INTERACTION BUTTONS
        _bindControllerActions($root, photoCanvas);
    }


    function destroy() {
        // destroy all the state and clear dom here
    }

    _init();

    return {
        getPrintDescription: photoCanvas.getPrintDescription,
        applyPrintDescription: photoCanvas.applyPrintDescription,
        destroy,
    }
}

module.exports = CanvasController;