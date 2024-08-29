from fastapi import FastAPI, File, UploadFile
import shutil
import os
from approaches.mobilenet import MobilenetClassification
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

DEFAULT_CLASS = os.getenv('DEFAULT_CLASS', 'alb_id')

@app.post("/classify")
async def create_upload_file(file: UploadFile = File(...)):
    """
    Receives an uploaded file and classifies it using the MobilenetClassification model.
    Returns the filename, predicted class, and probability of the prediction.
    """
    
    try:
        base_path = "temp_uploads"  # Temporarily save files here
        if not os.path.exists(base_path):
            os.makedirs(base_path)


        temp_file_path = os.path.join(base_path, file.filename)

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        model = MobilenetClassification(temp_file_path)
        predicted_class, probability = model.predict()

        os.remove(temp_file_path)

        result = {"filename": file.filename, 
                    "predicted_class": predicted_class, 
                    "probability": float(probability)}
        
        return result
    
    except Exception as e:
        # Cleanup in case of error
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        return {"filename": file.filename, 
                    "predicted_class": DEFAULT_CLASS, 
                    "probability": float(0)}

