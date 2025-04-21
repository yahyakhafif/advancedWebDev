import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { styleAPI } from '../api/api';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
    const [featuredStyles, setFeaturedStyles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        const fetchFeaturedStyles = async () => {
            try {
                const res = await styleAPI.getAllStyles();

                if (res.data.length > 0) {
                    // Get first 3 styles as featured
                    setFeaturedStyles(res.data.slice(0, 3));
                } else {
                    // If no styles exist, set sample styles
                    setFeaturedStyles([
                        {
                            _id: 'sample1',
                            name: 'Gothic',
                            period: '12th-16th century',
                            description: 'Gothic architecture is characterized by pointed arches, ribbed vaults, flying buttresses, and large stained glass windows.',
                            imageUrl: 'https://images.unsplash.com/photo-1543832923-44667a44c804?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                        },
                        {
                            _id: 'sample2',
                            name: 'Art Deco',
                            period: '1920s-1930s',
                            description: 'Art Deco architecture features bold, geometric patterns, vibrant colors, and stylized representations of natural and machine-made objects.',
                            imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                        },
                        {
                            _id: 'sample3',
                            name: 'Modernism',
                            period: '1920s-1980s',
                            description: 'Modernist architecture emphasizes function, simplicity, clean lines, and the use of industrial materials like concrete, glass, and steel.',
                            imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                        }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching styles:', err);
                // Set sample styles if API fails
                setFeaturedStyles([
                    {
                        _id: 'sample1',
                        name: 'Gothic',
                        period: '12th-16th century',
                        description: 'Gothic architecture is characterized by pointed arches, ribbed vaults, flying buttresses, and large stained glass windows.',
                        imageUrl: 'https://images.unsplash.com/photo-1543832923-44667a44c804?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                    },
                    {
                        _id: 'sample2',
                        name: 'Art Deco',
                        period: '1920s-1930s',
                        description: 'Art Deco architecture features bold, geometric patterns, vibrant colors, and stylized representations of natural and machine-made objects.',
                        imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                    },
                    {
                        _id: 'sample3',
                        name: 'Modernism',
                        period: '1920s-1980s',
                        description: 'Modernist architecture emphasizes function, simplicity, clean lines, and the use of industrial materials like concrete, glass, and steel.',
                        imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedStyles();
    }, []);

    if (loading) {
        return <div className="center">Loading...</div>;
    }

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-logo-container">
                        <svg className="hero-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="4" />
                            <rect x="35" y="50" width="30" height="40" fill="none" stroke="currentColor" strokeWidth="3" />
                            <rect x="45" y="70" width="10" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                            <line x1="20" y1="90" x2="80" y2="90" stroke="currentColor" strokeWidth="4" />
                        </svg>
                    </div>
                    <h1>Discover Architecture with Architex</h1>
                    <p>
                        Explore the beauty and history of architecture from around the world.
                        Learn about different styles, their characteristics, and famous examples.
                    </p>
                    <Link to="/styles" className="btn btn-primary">
                        Browse Styles
                    </Link>
                </div>
            </section>

            <section className="featured">
                <div className="container">
                    <h2>Featured Styles</h2>
                    <div className="styles-grid">
                        {featuredStyles.map((style) => (
                            <div key={style._id} className="style-card">
                                {style.imageUrl && (
                                    <img
                                        src={style.imageUrl}
                                        alt={style.name}
                                        className="style-image"
                                    />
                                )}
                                <div className="style-content">
                                    <h3>{style.name}</h3>
                                    <p>{style.period}</p>
                                    <p>{style.description.substring(0, 100)}...</p>
                                    {!style._id.startsWith('sample') ? (
                                        <Link to={`/styles/${style._id}`} className="btn btn-outline">
                                            Learn More
                                        </Link>
                                    ) : (
                                        isAdmin ? (
                                            <Link to="/styles/add" className="btn btn-outline">
                                                Add Real Styles
                                            </Link>
                                        ) : (
                                            <span className="sample-badge">Sample</span>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="info">
                <div className="info-content">
                    <h2>About Architex</h2>
                    <p>
                        Architex is your comprehensive resource for exploring architectural styles throughout history.
                        Whether you're a student, professional architect, or simply an enthusiast, our platform provides
                        detailed information about architectural movements, their distinctive features, and iconic examples.
                    </p>
                    <p>
                        Create an account to save your favorite styles and contribute to our growing community of
                        architecture lovers.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
