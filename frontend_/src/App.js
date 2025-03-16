import React, { useState } from "react";
import "./App.css";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [kernelSize, setKernelSize] = useState(3);
    const [zValue, setZValue] = useState(8);
    const [filteredImages, setFilteredImages] = useState({});

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const applyFilters = async () => {
        if (!selectedFile) {
            alert("Please upload an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("kernel_size", kernelSize);
        formData.append("z", zValue);

        try {
            const response = await fetch("https://image-filter-app-qqg0.onrender.com/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to process image. Please try again.");
            }

            const data = await response.json();
            setFilteredImages(data);
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while applying filters.");
        }
    };

    return (
        <div className="container">
            <h1>Image Filtering Tool</h1>

            <div className="file-upload">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {fileName && <p className="file-name">Selected: {fileName}</p>}
            </div>

            <div className="sliders">
                <div className="slider-container">
                    <label>Filter Window Size: {kernelSize}</label>
                    <input
                        type="range"
                        min="3"
                        max="15"
                        step="2"
                        value={kernelSize}
                        onChange={(e) => setKernelSize(e.target.value)}
                    />
                </div>

                <div className="slider-container">
                    <label>Edge Detection Strength: {zValue}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={zValue}
                        onChange={(e) => setZValue(e.target.value)}
                    />
                </div>
            </div>

            <button onClick={applyFilters}>Apply Filters</button>

            {filteredImages.mean && (
                <div className="image-container">
                    <div className="image-card">
                        <h4>Original</h4>
                        <img src={URL.createObjectURL(selectedFile)} alt="Original" />
                    </div>
                    <div className="image-card">
                        <h4>Mean Filter</h4>
                        <img src={`data:image/jpeg;base64,${filteredImages.mean}`} alt="Mean Filtered" />
                    </div>
                    <div className="image-card">
                        <h4>Max Pooling</h4>
                        <img src={`data:image/jpeg;base64,${filteredImages.max}`} alt="Max Pooling" />
                    </div>
                    <div className="image-card">
                        <h4>Min Pooling</h4>
                        <img src={`data:image/jpeg;base64,${filteredImages.min}`} alt="Min Pooling" />
                    </div>
                    <div className="image-card">
                        <h4>Edge Detection</h4>
                        <img src={`data:image/jpeg;base64,${filteredImages.diff}`} alt="Differentiator" />
                    </div>
                </div>
            )}

            <footer>Created by Rachit Jain - IIT Bhubaneswar</footer>
        </div>
    );
}

export default App;
