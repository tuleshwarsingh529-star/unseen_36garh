module.exports = {
  apps: [
    {
      name: 'cg-tourism-backend',
      // Use the .bat launcher which sets env vars inline — avoids Windows
      // pnpm .cmd SyntaxError and ensures DATABASE_URL is correctly set.
      script: 'start-backend.bat',
      cwd: __dirname,
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'cg-tourism-frontend',
      script: 'start-frontend.bat',
      cwd: __dirname,
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};

