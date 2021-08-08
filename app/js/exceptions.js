function InvalidDOMElementException(message) {
    this.message = message;
    this.name = 'DOMException';
}

// Add more common exceptions here

module.exports = {
    InvalidDOMElementException
}