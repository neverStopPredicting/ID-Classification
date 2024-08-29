import './App.css';
import React, { useState } from "react";
import { createRef } from "react"; 

function App() {

    const fileInput = createRef(); //store the file input
    const [file, setFile] = useState(); //the selected file for preview
    const [responseMessage, setResponseMessage] = useState(''); // Message from the backend
    const [confidenceColor, setConfidenceColor] = useState(''); // Color to indicate confidence level
    const [isLoading, setIsLoading] = useState(false); // Loading state indicator

    // Handle file selection
    function handleChange(event) {
      const file = event.target.files[0];
      const fileNameDisplay = document.getElementById('file-name');
    
      if (file) {
        const fileName = file.name;
        fileNameDisplay.textContent = fileName;
    
        // Create object URL only if the file is present
        const objectURL = URL.createObjectURL(file);
        setFile(objectURL);
        setResponseMessage(' ');
      } else {
        fileNameDisplay.textContent = 'No file chosen';
      }
    }

    // Handle image submission
    // POST request to the server with the selected file
    // Update UI based on the server response
    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage("");
        setConfidenceColor("red");
        const formData = new FormData();
        formData.set("file", fileInput.current.files[0])

        try {
            const response = await fetch('/submit', {
              method: "POST",
              body: formData
            });
            
            const parsedResponse = await response.json();
            if (response.ok) {
              setResponseMessage(parsedResponse.predicted_class);
              setConfidenceColor(parsedResponse.confidence_color);
            } else {
              console.error("Some error occurred");
              setResponseMessage("Failed to Process.");
              setConfidenceColor("red");
            }


        } catch (e) {
          console.error(e.message)
        } finally {
          setIsLoading(false); // Stop loading after the operation is complete or in case of an error
        }
        
      
    }

    return (

        <div className="App">
            
            <div className="header-container">
              <img src="/classifier_logo.png" alt="Classifier Logo" />
            </div>
            <h1>ID Classification</h1>
            <div id="file-name">No file chosen</div>

            {/* Loading indicator visibility controlled by isLoading state */}
            {isLoading && (
              <div className="loader-container">
                <div className="loader"></div>
              </div>
            )}

            {/* Previewing the selected file */}
            <div className="blue-background">
              <img src={file} className="uploadedImage" alt="Uploaded ID" />
            </div>

            {/* Show the predicted class with its color indicates the confidence level*/}
            <div className="response-message" style={{ color: confidenceColor }}>{responseMessage}</div>
            
            {/* Form for file submission */}
            <form onSubmit={onSubmit}>
              <label htmlFor="file-upload" className="custom-file-upload green-button">
                Choose file
              </label>
              <input id="file-upload" type="file" name="image" ref={fileInput} onChange={handleChange} style={{display: 'none'}} />
              <input className="green-button" type="submit" value="Submit" />
            </form>
            
        </div>

    );
}
 

export default App;