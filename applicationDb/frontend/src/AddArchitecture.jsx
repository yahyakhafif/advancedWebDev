import React, { useState } from 'react';

function AddArchitecture({ onAdd }) {
    const [formData, setFormData] = useState({
        architecture_name: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create a FormData object and append the file and other fields
        const data = new FormData();
        if (selectedFile) {
            data.append('architecture_image', selectedFile);
        }
        data.append('architecture_name', formData.architecture_name);
        data.append('description', formData.description);

        // Use fetch to send the data to the backend
        fetch('http://localhost:3000/architectures', {
            method: 'POST',
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                if (onAdd) onAdd(data);
                // Reset form fields
                setFormData({ architecture_name: '', description: '' });
                setSelectedFile(null);
            })
            .catch((err) => console.error('Error adding data:', err));
    };

    return (
        <div className="mt-4">
            <h2>Add Architecture</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                        type="file"
                        className="form-control"
                        name="architecture_image"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Architecture Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="architecture_name"
                        value={formData.architecture_name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Add Architecture
                </button>
            </form>
        </div>
    );
}

export default AddArchitecture;
