import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(dotenv_path='./.env')

DEFAULT_CLASS = os.getenv('DEFAULT_CLASS', 'alb_id')
CLASS_LIST = ['alb_id', 'aze_passport', 'esp_id', 'est_id', 'fin_id',
        'grc_passport', 'lva_passport', 'rus_internalpassport',
        'srb_passport', 'svk_id']

class MobilenetClassification:
    """
    A class for image classification using MobileNetV3 and a custom trained classifier.

    Attributes
    ----------
    mobilenet : tf.keras.Model
        Pretrained MobileNetV3 model for feature extraction.
    classifier : tf.keras.Model
        Custom trained classifier model for classifying the extracted features.
    file_path : str
        Path to the image file to be classified.
    image_array : np.ndarray
        Preprocessed image ready for feature extraction.
    features : np.ndarray
        Extracted features from the image.
    predicted_class : str
        Predicted class of the image.
    probability : float
        Probability associated with the predicted class.
    """

    mobilenet = MobileNetV3Large(weights='imagenet', include_top=False, pooling='avg')
    classifier = tf.keras.models.load_model('./models/model_epoch_250.h5')

    
    def __init__(self, file_path):

        self.file_path = file_path
        self.image_array = np.zeros((1,224,224,3))
        self.features = np.zeros((1,960))
        self.predicted_class = DEFAULT_CLASS
        self.probability = 0
    

    def load_image_for_mobilenet(self):
        """
        Load and resize the image to (224, 224), convert to a numpy array, and
        preprocess according to the requirements of MobileNetV3.
        """
        
        img = image.load_img(self.file_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) 
        self.image_array = preprocess_input(img_array)  
    
    def extract_features_batch(self):
        """
        Extracts features from the preprocessed image using MobileNetV3.
        """
        
        self.features = MobilenetClassification.mobilenet.predict(self.image_array)
        
    def classify(self):
        """
        Classifies the extracted features using the custom trained classifier.
        
        Updates the `predicted_class` and `probability` attributes with the prediction results.
        """

        predict = MobilenetClassification.classifier.predict(self.features)   
        self.predicted_class = CLASS_LIST[int(predict.argmax(axis=1)[0])]
        self.probability = np.max(predict)

    def predict(self):
        """
        Predicts the class of the image by executing the loading, preprocessing, 
        feature extraction, and classification pipeline.

        Returns
        -------
        predicted_class : str
            The class predicted by the classifier.
        probability : float
            The probability of the predicted class.
        """
        
        self.load_image_for_mobilenet()
        self.extract_features_batch()
        self.classify()

        return self.predicted_class, self.probability
    