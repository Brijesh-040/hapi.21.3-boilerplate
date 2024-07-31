module.exports = {
  appName: 'DSC-PROD',

  port: 1408,

  debug: {
    request: ['error', 'info'],
    log: ['info', 'error', 'warning']
  },

  constants: {
    s3Prefix: 'PROD',
    API_BASEPATH: 'localhost:1408',
    DEFAULT_COUNTRY: 'IND',
    DEFAULT_TIMEZONE: 'Asia/Kolkata',
    SERVER_TIMEZONE: 'Asia/Kolkata',
    EXPIRATION_PERIOD: '24h', // 730h
    JWT_SECRET: 'DSC-authorise-user',
    CONSOLE_BASEPATH: "https://dsc.com"
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
