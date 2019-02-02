//const shost = require('./app');
const host = require('./app');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//shost.listen(443);
host.listen(port, ipaddress);
