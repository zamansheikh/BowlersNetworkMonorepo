// PM2 Process Manager Config
// Run: pm2 start ecosystem.config.cjs
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "amateur-player",
      cwd: "./apps/amateur-player",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5001",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
    {
      name: "pro-player",
      cwd: "./apps/pro-player",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5002",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5002,
      },
    },
    {
      name: "bowling-center",
      cwd: "./apps/bowling-center",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5003",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5003,
      },
    },
    {
      name: "bowling-manufacturers",
      cwd: "./apps/bowling-manufacturers",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5004",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5004,
      },
    },
    {
      name: "tournament-director",
      cwd: "./apps/tournament-director",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5005",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5005,
      },
    },
    {
      name: "staffs",
      cwd: "./apps/staffs",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5006",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5006,
      },
    },
    {
      name: "bowl-ques",
      cwd: "./apps/bowl-ques",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 5007",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 5007,
      },
    },
  ],
};
