const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

// Object to map the prediction to user friendly display
const idDisplayMap = {
  alb_id: 'ID Card of Albania',
  aze_passport: 'Passport of Azerbaijan',
  esp_id: 'ID Card of Spain',
  est_id: 'ID Card of Estonia',
  fin_id: 'ID Card of Finland',
  grc_passport: 'Passport of Greece',
  lva_passport: 'Passport of Latvia',
  rus_internalpassport: 'Internal passport of Russia',
  srb_passport: 'Passport of Serbia',
  svk_id: 'ID Card of Slovakia'
};

// Function to map probability to color
const probabilityToColor = (probability) => {
  // High confidence (Above or equal to the avg correct prediction score)
  if (probability >= 0.945) return 'rgb(8, 68, 68)'; 
  // Medium confidence (Higher than 1 std below the avg correct prediction)
  if (probability >= 0.829) return 'rgb(254, 164, 46)'; 
  return 'rgb(234, 1, 108)'; // Low confidence ()
};

router.use(fileUpload({
  createParentPath: true
}));

router.post('/', async (req, res) => {
  // Check if files were uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const formData = new FormData();
  formData.append('file', file.data, file.name);

  try {
    // Make a POST request to the classifier with the file
    const fastApiResponse = await axios.post(process.env.CLASSIFIER_URL + '/classify', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    const displayText = idDisplayMap[fastApiResponse.data.predicted_class] || 'Unknown ID type';
    const confidenceColor = probabilityToColor(fastApiResponse.data.probability);


    // Send back the response from the classifier to frontend
    res.status(200).json({predicted_class:displayText, 
      confidence_color: confidenceColor,
      filename: fastApiResponse.data.filename
    });
  } catch (error) {
    console.error('Error forwarding file:', error);
    res.status(500).send('Error forwarding file to FastAPI server');
  }
});

module.exports = router;
