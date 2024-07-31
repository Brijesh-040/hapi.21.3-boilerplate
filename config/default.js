module.exports = {
  appName: 'DSC',

  port: 1400,

  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },

  constants: {
    s3Prefix: 'local',
    API_BASEPATH: 'localhost:1400',
    DEFAULT_COUNTRY: 'IND',
    DEFAULT_TIMEZONE: 'Asia/Kolkata',
    SERVER_TIMEZONE: 'Asia/Kolkata',
    EXPIRATION_PERIOD: '24h', // 730h
    JWT_SECRET: 'DSC-authorise-user',
    s3cdnUrl: `https://${process.env.PUBLIC_AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
    CONSOLE_BASEPATH: "http://localhost:3000",
    log: {
      secret: [
      'req.headers.authorization',
      'req.headers.dnt',
      // 'req.headers.host',
      'req.headers.accept',
      // 'req.headers.referer',
      'req.headers.connection',
      'req.headers[`sec-ch-ua`]',
      'req.headers[`sec-ch-ua-mobile`]',
      'req.headers[`sec-ch-ua-platform`]',
      'req.headers[`sec-fetch-dest`]',
      'req.headers[`sec-fetch-mode`]',
      'req.headers[`sec-fetch-site`]',
      'req.headers[`accept-language`]',
      'req.headers[`accept-encoding`]', 
      '*.password'],
      needToRemove: false, // true :  will remove above defined arrays variable from response
      dbignore: ['ignore']
    }
  },

  connections: {
    db: process.env.DB,
    aws: {
      ses: {
        key: process.env.AWS_ACCESS_KEY,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        public_bucket: process.env.PUBLIC_AWS_BUCKET,
        private_bucket: process.env.PRIVATE_AWS_BUCKET,
        region: process.env.AWS_REGION
      }
    }
  }
}
