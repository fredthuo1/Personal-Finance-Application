import React, { useState } from 'react';

const Carousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevItem = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    return (
        <div className="carousel-container">
            <button className="carousel-button" onClick={prevItem}>&#8592;</button>
            <div className="carousel-content">
                {items[currentIndex]}
            </div>
            <button className="carousel-button" onClick={nextItem}>&#8594;</button>
        </div>
    );
};

export default Carousel;
