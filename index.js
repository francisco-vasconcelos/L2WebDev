//const shost = require('./app');
const host = require('./app');

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0';
//shost.listen(443);
host.listen(port, ip);
