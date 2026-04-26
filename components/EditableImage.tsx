import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { getImageUrl480 } from '../lib/imageDisplayUrl';

interface EditableImageProps {
  src: string;
  onChange: (newSrc: string) => void;
  className?: string;
  alt?: string;
  rounded?: boolean;
}

export const EditableImage: React.FC<EditableImageProps> = ({ src, onChange, className = "", alt = "image", rounded = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const displaySrc = getImageUrl480(src);
  return (
    <div
      className={`group relative cursor-pointer overflow-hidden bg-black ${className} ${rounded ? 'rounded-full' : ''}`}
      onClick={handleClick}
    >
      <img
        src={displaySrc}
        alt={alt}
        className={`h-full w-full object-cover ${rounded ? 'rounded-full' : ''}`}
        width={480}
        height={480}
        loading="lazy"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${rounded ? 'rounded-full' : ''}`}>
        <Camera className="w-6 h-6 text-white" />
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};