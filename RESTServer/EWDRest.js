var ewdrest = require('ewdrest');

var EWD = {
  restPort: 8081,
  service: {
    fhir: {
      module: 'FHIRServer',
      service: 'parse',
      contentType: 'application/json'
    }
  },
  server: {
    local: {
      host: 'localhost',
      port: 8080,
      ssl: true,
      secretKey: 'xxxxxx',
      accessId: 'yyyyyyy'
    },
    george: {
      host: 'ccda.vistaewd.net',
      port: 8084,
      ssl: true,
      secretKey: 'xxxxxx',
      accessId: 'yyyyyy'
    },
    ec2: {
      host: 'ec2-99-99-99-99.compute-1.amazonaws.com',
      port: 80,
      ssl: false,
      secretKey: 'xxxxx',
      accessId: 'yyyyy'
    }
  }
};

ewdrest.start(EWD);
