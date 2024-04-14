export function backend_py(mongo_client_url: string = 'mongodb://localhost:27017', mongo_database_name: string = 'laia', 
                            openapi_file_name: string = 'openapi.yaml', backend_port: string = '8000', 
                            backend_folder_name: string = 'backend', backend_jwt_secret_key: string = 'secret_key') {
    return `
from laiagenlib.Infrastructure.Openapi.LaiaFastApi import LaiaFastApi
from laiagenlib.Infrastructure.LaiaBaseModel.MongoModelRepository import MongoModelRepository
from laiagenlib.Infrastructure.Openapi.FastAPIOpenapiRepository import FastAPIOpenapiRepository
from pymongo import MongoClient
from multiprocessing import Process
import os
import uvicorn
import requests
import time
import asyncio
import yaml
import json

client = MongoClient("${mongo_client_url}")

db = client.${mongo_database_name}

openapi_path = os.path.join(os.getcwd(), "${openapi_file_name}")

async def backend():
    app_instance = await LaiaFastApi(openapi_path, "${backend_folder_name}", db, MongoModelRepository, FastAPIOpenapiRepository, "${backend_jwt_secret_key}")
    
    app = app_instance.api

    from backend.routes import ExtraRoutes
    app.include_router(ExtraRoutes(app_instance.repository_instance))
    return app

app = asyncio.run(backend())

uvicorn_process = Process(target=uvicorn.run,
            args=(app,),
            kwargs={
                "host": "0.0.0.0",
                "port": ${backend_port}})

uvicorn_process.start()

time.sleep(2)

response = requests.get("http://localhost:${backend_port}/openapi.json")
if response.status_code == 200:
    openapi_yaml = yaml.dump(json.loads(response.text), default_flow_style=False)
    with open(openapi_path, "wb") as f: 
        f.write(openapi_yaml.encode("utf-8"))
else:
    print("Failed to retrieve OpenAPI YAML file.")

app = asyncio.run(backend())
    `;
}

export function frontend_py(openapi_file_name: string = 'openapi.yaml', backend_folder_name: string = 'backend', frontend_folder_name: string = 'frontend') {
    return `
from laiagenlib.Infrastructure.Openapi.LaiaFlutter import LaiaFlutter
import os
import asyncio

openapi_path = os.path.join(os.getcwd(), "${openapi_file_name}")

async def frontend():
    await LaiaFlutter(openapi_path, "${backend_folder_name}", "${frontend_folder_name}")
    
asyncio.run(frontend())    
    `;
}