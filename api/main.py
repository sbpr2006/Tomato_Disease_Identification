import io
import uvicorn
import numpy as np
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from PIL import Image

from fastapi import FastAPI
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
endpoint="http://localhost:8999/v1/models/tmt_model:predict"
class_names =['Tomato_Bacterial_spot',
                'Tomato_Early_blight',
                'Tomato_Late_blight',
                'Tomato_Leaf_Mold',
                'Tomato_Septoria_leaf_spot',
                'Tomato_Spider_mites_Two_spotted_spider_mite',
                'Tomato__Target_Spot',
                'Tomato__Tomato_YellowLeaf__Curl_Virus',
                'Tomato__Tomato_mosaic_virus',
                'Tomato_healthy']

@app.post("/predict")
async def predict(file:UploadFile=File(...)):
    fl=await file.read()

    img=np.array(Image.open(io.BytesIO(fl)))
    batch_images=np.expand_dims(img,axis=0)

    response= requests.post(endpoint,json={"instances":batch_images.tolist()})
    if response.status_code!=200:
        return {"tf_serving_response":response.text}

    predictions=np.array(response.json()['predictions'][0])
    predicted_class=class_names[np.argmax(predictions)]

    return {"prediction": predicted_class, "confidence": float(np.max(predictions))}


if __name__=="__main__":
    uvicorn.run(app,host="localhost",port=9090)