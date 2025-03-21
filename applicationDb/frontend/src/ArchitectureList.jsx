import React, { useState, useEffect } from 'react';

function ArchitectureList() {
    const [architectures, setArchitectures] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/architectures')
            .then((res) => res.json())
            .then((data) => setArchitectures(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="mt-4">
            <h2>Architectures</h2>
            <ul className="list-group">
                {architectures.map((arch) => (
                    <li key={arch.id} className="list-group-item">
                        <img
                            src={`http://localhost:3000${arch.architecture_image}`}
                            alt={arch.architecture_name}
                            className="img-thumbnail me-3"
                            style={{ width: '100px' }}
                        />
                        <div>
                            <h5>{arch.architecture_name}</h5>
                            <p>{arch.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArchitectureList;
