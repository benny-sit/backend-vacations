const dotenv = require('dotenv')
const fs = require('fs')


let currentConfig;
if(fs.existsSync('.env')) {
  const env = fs.readFileSync('.env')
  const buf = Buffer.from(env)
  currentConfig = dotenv.parse(buf)
} else {
  currentConfig = {}
  fs.writeFileSync('.env', '');
}

export function updateEnv(config = {}, eol = '\n'){
  const envContents = Object.entries({...currentConfig, ...config})
    .map(([key,val]) => `${key}=${val}`)
    .join(eol)
  fs.writeFileSync('.env', envContents);
}

