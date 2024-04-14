const YAML = require('yaml');
import * as path from 'path';
import * as fs from 'fs';

export const config_yaml = {
  mongo: {
    'client_url': 'mongodb://localhost:27017',
    'database_name': 'laia'
  },
  openapi: {
    'file_name': 'openapi.yaml'
  },
  backend: {
    'port': 8000,
    'folder_name': 'backend',
    'jwt_secret_key': 'secret_key'
  },
  frontend: {
    'folder_name': 'frontend',
    'backend_base_url': 'http://localhost:8000'
  },
  laia: {
    'llm_model': 'openai',
    'logs_conversation_records': true
  },
  openai: {
    'api_key': 'sk ....'
  }
};

export function readConfigYaml(directoryPath: string | undefined) {
  try {
      const filePath = path.join(directoryPath!, 'config.yaml');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const config = YAML.parse(fileContents);
      return config;
  } catch (error) {
      console.error('Error reading config.yaml:', error);
      return null;
  }
}

export const requirements_txt = `requests
uvicorn
laia-gen-lib
`