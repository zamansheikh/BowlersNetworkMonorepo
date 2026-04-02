// PM2 Process Manager Config
// Run: pm2 start ecosystem.config.cjs
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "amateur-player",
      cwd: "./apps/amateur-player",
      script: "node_modules/.bin/next",
      args: "start --port 4001",
      env: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
    {
      name: "pro-player",
      cwd: "./apps/pro-player",
      script: "node_modules/.bin/next",
      args: "start --port 4002",
      env: {
        NODE_ENV: "production",
        PORT: 4002,
      },
    },
    {
      name: "bowling-center",
      cwd: "./apps/bowling-center",
      script: "node_modules/.bin/next",
      args: "start --port 4003",
      env: {
        NODE_ENV: "production",
        PORT: 4003,
      },
    },
    {
      name: "bowling-manufacturers",
      cwd: "./apps/bowling-manufacturers",
      script: "node_modules/.bin/next",
      args: "start --port 4004",
      env: {
        NODE_ENV: "production",
        PORT: 4004,
      },
    },
    {
      name: "tournament-director",
      cwd: "./apps/tournament-director",
      script: "node_modules/.bin/next",
      args: "start --port 4005",
      env: {
        NODE_ENV: "production",
        PORT: 4005,
      },
    },
    {
      name: "staffs",
      cwd: "./apps/staffs",
      script: "node_modules/.bin/next",
      args: "start --port 4006",
      env: {
        NODE_ENV: "production",
        PORT: 4006,
      },
    },
    {
      name: "bowl-ques",
      cwd: "./apps/bowl-ques",
      script: "node_modules/.bin/next",
      args: "start --port 4007",
      env: {
        NODE_ENV: "production",
        PORT: 4007,
      },
    },
  ],
};
