
// Function to get a single image data from the given file input element
function imageGetter( $element, callback ) {
    $element.onchange = function( e ) {
        // get all selected Files
        var files = e.target.files;
        var file;
        for ( var i = 0; i < files.length; ++i ) {
            file = files[ i ];
            // check if file is valid Image (just a MIME check)
            switch ( file.type ) {
                case "image/jpeg":
                case "image/png":
                case "image/gif":
                    // read Image contents from file
                    var reader = new FileReader();
                    reader.onload = function ( event ) {
                        callback && callback(reader.result, file.name, event);
                    }
                    reader.readAsDataURL( file );
                    // process just one file.
                    return;


                default:
                    // log( "not a valid Image file :" + file.name );
            }
        }
    };
}

// Function to return how the given img can be fit within the given canvas
// Takes either width or height and multiplies the other value by the same ratio to fill the canvas
function getNaturalFit(canvasWidth, canvasHeight, img) {
    let canvasAspectRatio = canvasWidth / canvasHeight;
    let imgAspectRatio = img.naturalWidth / img.naturalHeight;
    if (canvasAspectRatio < imgAspectRatio) {
        return {
            width: img.naturalWidth * canvasHeight / img.naturalHeight,
            height: canvasHeight
        }
    } else {
        return {
            width: canvasWidth,
            height: img.naturalHeight * canvasWidth / img.naturalWidth
        }
    }
}

// This function makes sure the image fits in the best possible way in the given canvas
// If the image needs to be rotated, it swaps the width and height, and then calculates
// the natural fit for swapped dimensions
function getBestFit(canvasWidth, canvasHeight, img) {
    let imgAspectRatio = img.naturalWidth / img.naturalHeight;
    let isRotated = imgAspectRatio < 1;
    let imgDimensions = {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
    }
    // To make the best fit of the photo inside the canvas, 
    // just invert the image dimensions if the photo is in portrait mode
    if (isRotated) {
        imgAspectRatio = img.naturalHeight / img.naturalWidth;
        imgDimensions = {
            naturalWidth: img.naturalHeight,
            naturalHeight: img.naturalWidth,
        }
    }

    let dimensions = getNaturalFit(canvasWidth, canvasHeight, imgDimensions);
    dimensions.isRotated = isRotated;
    return dimensions;
}

module.exports = {
    imageGetter,
    getBestFit,
    getNaturalFit,
}