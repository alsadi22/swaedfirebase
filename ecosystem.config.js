module.exports = {
  apps: [{
    name: 'swaeduae-platform',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/swaeduae/swaed2025/swaeduae',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HTTP_TIMEOUT: 30000,
      HTTPS_TIMEOUT: 30000,
      AUTH0_HTTP_TIMEOUT: 30000,
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'swaeduae_user',
      POSTGRES_PASSWORD: 'swaeduae_password',
      POSTGRES_DB: 'swaeduae',
      DATABASE_URL: 'postgresql://swaeduae_user:swaeduae_password@localhost:5432/swaeduae'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
