/**
 * PM2 Configuration — Step 14 (Production Polish)
 * Production process management for EduFlow CRM Backend
 */

module.exports = {
  apps: [
    {
      name: 'eduflow-backend',
      script: 'dist/server.js',

      // Clustering — use 2 instances to avoid RAM issues on small servers
      instances: process.env.PM2_INSTANCES || 2,
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        TZ: 'Asia/Tashkent',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        TZ: 'Asia/Tashkent',
      },

      // Restart strategy
      max_memory_restart: '400M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      merge_logs: true,
      log_type: 'json',

      // Log rotation — keep last 7 days, max 10MB per file
      max_size: '10M',
      retain: 7,

      // Watch (disable in production)
      watch: false,

      // Graceful shutdown
      kill_timeout: 15000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Wait for ready signal
      wait_ready: true,
    },
  ],
};
