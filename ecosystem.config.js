/**
 * pm2 process supervision for GENI.
 *
 * Usage:
 *   cd backend && npm run build        # compile TypeScript first
 *   pm2 start ecosystem.config.js      # from repo root
 *   pm2 logs geni-backend
 *   pm2 monit
 *
 * The Python fall-detection sidecars are spawned and supervised by the
 * backend itself (fall-detection.ts / fall-pose-stream.ts), so pm2 only
 * needs to keep the Node process alive. If the backend dies, its child
 * processes die with it and everything restarts together.
 */
module.exports = {
  apps: [
    {
      name: 'geni-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 5000,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: './logs/geni-backend.out.log',
      error_file: './logs/geni-backend.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
