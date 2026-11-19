module.exports = {
  apps: [
    {
      name: 'portfolio',
      cwd: __dirname,
      script: './dist/server.js',
      instances: 1, // Single instance recommended for SQLite WAL persistence
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      error_file: './data/logs/pm2-err.log',
      out_file: './data/logs/pm2-out.log',
      time: true,
    },
  ],
};
