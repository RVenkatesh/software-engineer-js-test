var debugContainer = document.getElementById( 'debugContainer' );
function log( msg, error = false ) {
    // show debug/state message on screen
    debugContainer.innerHTML += `<p class="${error && "error" }">${msg}</p>`;
}

module.exports = log;