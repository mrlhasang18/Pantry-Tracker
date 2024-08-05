'use '
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageFetcher = ({ itemName, width = 400, height = 300 }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`https://api.freepik.com/v1/search?query=${itemName}&orientation=horizontal&image_type=photo&api_key=${process.env.REACT_APP_FREEPIK_API_KEY}`);
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          setImageUrl(data.hits[0].preview_url);
        } else {
          setImageUrl('');
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl('');
      }     
    };

    fetchImage();
  }, [itemName]);

  return (
    <Image
      src={imageUrl || `/api/placeholder/${width}/${height}`}
      width={width}
      height={height}
      alt={itemName}
      layout="responsive"
    />
  );
};

export default ImageFetcher;