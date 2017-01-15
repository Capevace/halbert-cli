#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const argv = require('yargs').argv;
const uuid = require('uuid').v4;

const CONFIG_PATH = path.resolve(__dirname, '../halbert.config.json');
const MODULES_PATH = path.resolve(__dirname, '../modules');

if (!argv._ || argv._.length <= 0) {
  console.log('H.A.L.B.E.R.T.');
  console.log('Use the CLI like this: halbert <command> <arguments>');
  console.log('');
  console.log('Commands:');
  console.log('    new - Creates a new H.A.L.B.E.R.T. Project');
  console.log('    start - Launches a new H.A.L.B.E.R.T. instance');
} else if (argv._[0] === 'new') {
  const folderName = argv._[1];

  if (!folderName) {
    console.log('Please provide a name for the folder to be created.');
    process.exit(0);
  }

  const folderPath = path.resolve(__dirname, folderName);

  if (fs.existsSync(folderPath)) {
    console.log('The folder already exists.');
    process.exit(0);
  } else {
    const defaultConfig = {
      device: {
        uuid: uuid()
      },
      "weather": {
        "openWeatherMapApiKey": "<ENTER-YOUR-OPEN-WEATHER-MAP-API-KEY>"
      },
      "server": {
        "port": 3000,
        "cacheTemplates": false
      },
      "users": [
        {
          "username": "admin",
          "password": "halbert"
        }
      ],
      "modules": {
        "switches": {
          "gpio": {
            "remote": 15
          },
          "available": []
        },
        "ifttt": {
          "apiKey": "<YOUR-IFTTT-API-KEY>",
          "webhookSecret": uuid()
        }
      }
    };

    fs.mkdirSync(folderPath);
    fs.mkdirSync(path.resolve(folderPath, 'modules'));
    fs.writeFileSync(
      path.resolve(folderPath, 'halbert.config.json'),
      JSON.stringify(defaultConfig, null, 2),
      'utf8'
    );
    fs.writeFileSync(
      path.resolve(folderPath, 'package.json'),
      JSON.stringify({
        dependencies: {
          'halbert-ai': '^0.x'
        },
        scripts: {
          start: 'halbert-ai'
        }
      }, null, 2),
      'utf8'
    );
    console.log(`We're now running 'npm install'. If this doesn't work you have to do that manually.`);

    exec('cd ' + folderName, (err, stdin, stdout) => {
      const npm = spawn('npm', ['install']);

      npm.stdout.on('data', (data) => console.log(data));

      npm.stderr.on('data', (data) => console.log(data));

      npm.on('close', (code) => {
        console.log(`Your H.A.L.B.E.R.T. instance is now complete!`);
      });
    });
  }
} else if (argv._[0] === 'start') {
  const halbert = require('halbert-ai');
  halbert(
    path.resolve(__dirname, 'halbert.config.json'),
    path.resolve(__dirname, 'modules')
  );
} else {
  console.log('Command unknown.');
  console.log('Use the CLI like this: halbert <command> <arguments>');
  console.log('');
  console.log('Commands:');
  console.log('    new - Creates a new H.A.L.B.E.R.T. Project');
  console.log('    start - Launches a new H.A.L.B.E.R.T. instance');
}

// require('../system');
