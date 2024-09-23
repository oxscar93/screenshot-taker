const { URL } = require('url');

//validates url according to the given url and the given protocols (for example, http, https)
function validUrl(s, protocols){
    try {
        url = new URL(s);
        return protocols
            ? url.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};

module.exports = validUrl