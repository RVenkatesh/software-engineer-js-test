var { getBestFit, getNaturalFit } = require('./utilities');

function _getNewPhoto(width, height) {
    return {
        id: '',
        x: 0,
        y: 0,
        width,
        height,
        isRotated: false,
    };
} 

function PhotoCanvas(width, height, dpi = 300) {
    var canvas, context, image = new Image(),
        photo = _getNewPhoto(width, height);

    function _toPixels(value) {
        return value * dpi;
    }
    function _toInches(value) {
        return value / dpi;
    }
    function _createCanvas() {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');

        canvas.width = _toPixels(width);;
        canvas.height = _toPixels(height);
    }
    function _resetPhoto() {
        photo = _getNewPhoto(width, height);
    }
    function _drawImg() {
        if (!image.src) {
            return;
        }
        let cWidth, cHeight, pWidth, pHeight;
        if (photo.isRotated) {
            cWidth = _toPixels(height);
            cHeight = _toPixels(width);

            pWidth = _toPixels(photo.height);
            pHeight = _toPixels(photo.width);

            // Add rotated state to canvas class for the convenience of consuming modules
            canvas.classList.add('is-rotated');
        } else {
            cWidth = _toPixels(width);
            cHeight = _toPixels(height);

            pWidth = _toPixels(photo.width);
            pHeight = _toPixels(photo.height);

            canvas.classList.remove('is-rotated');
        }
        canvas.width = cWidth;
        canvas.height = cHeight;
        
        context.fillStyle = '#fff';
  		context.fillRect(0,0, cWidth, cHeight);

        context.drawImage(image, _toPixels(photo.x), _toPixels(photo.y), pWidth, pHeight);
    }

    function getCanvas() {
        return canvas;
    }

    function updateImg(img, bestFit = false) {
        let cWidth = _toPixels(width), cHeight = _toPixels(height);
        let fitPhoto = bestFit ? getBestFit : getNaturalFit;
        image.src = img.src;
        
        function load() {
            let fitDetails = fitPhoto(cWidth, cHeight, image);
            // Convert values to inches
            fitDetails.width = _toInches(fitDetails.width);
            fitDetails.height = _toInches(fitDetails.height);

            _resetPhoto();
            // Cache photo details
            photo = { ...photo, ...img, ...fitDetails };

            // Write image to canvas
            _drawImg();
        }
        if (img.id === photo.id) {
            load();
        }
        image.onload = load;
    }

    function getPrintDescription() {
        if (!image.src) {
            return;
        }
        return {
            width,
            height,
            photo,
        }
    }

    function applyPrintDescription(desc) {
        // Get details from description
        ({ width, height, photo } = desc);

        // Cache image
        image.src = photo.src;
        image.onload = _drawImg;
    }

    function _isValid(photo) {
        let leftExceeds = photo.x > 0,
            topExceeds = photo.y > 0,
            rightExceeds = (photo.x + photo.width) < width,
            bottomExceeds = (photo.height + photo.y) < height;
        
        if (photo.isRotated) {
            rightExceeds = (photo.x + photo.height) < height;
            bottomExceeds = (photo.y + photo.width) < width;
        }
        return !(leftExceeds || rightExceeds || topExceeds || bottomExceeds);
        // return true
    }

    // amount in inches
    function move(direction, amount) {
        if (!image.src) {
            return;
        }
        let newPhoto = { ...photo };
        if (newPhoto.isRotated) {
            direction = (direction === 'LEFT' && 'UP') || 
                    (direction === 'RIGHT' && 'DOWN') ||
                    (direction === 'UP' && 'RIGHT') ||
                    (direction === 'DOWN' && 'LEFT');
        }
        switch (direction) {
            case 'LEFT':
                newPhoto.x -= amount;
                break;
            case 'RIGHT':
                newPhoto.x += amount;
                break;
            case 'UP':
                newPhoto.y -= amount;
                break;
            case 'DOWN':
                newPhoto.y += amount;
                break;
        }
        // Fix movement accuracy to 2 floating points to avoid unnecessary decimal values of x and y
        newPhoto.x = parseFloat(newPhoto.x.toFixed(2));
        newPhoto.y = parseFloat(newPhoto.y.toFixed(2));

        if (_isValid(newPhoto)) {
            photo = newPhoto;
            _drawImg();
        }
    }

    function scale(value) {
        if (!image.src) {
            return;
        }
        let newPhoto = { ...photo };
        newPhoto.width *= value;
        newPhoto.height *= value;

        if (_isValid(newPhoto)) {
            photo = newPhoto;
            _drawImg();
        } else {
            // TODO: This can be done better
            updateImg({
                id: photo.id,
                src: image.src,
            }, true);
        }

    }

    function destroy() {
        // destroy all the state and clear dom here
    }

    // Create a simple canvas
    _createCanvas();

    return {
        getCanvas,
        updateImg,
        getPrintDescription,
        applyPrintDescription,
        move,
        scale,
        destroy,
    }
}
module.exports = PhotoCanvas;