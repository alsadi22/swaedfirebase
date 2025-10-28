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
      PORT: 3001
    },
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
