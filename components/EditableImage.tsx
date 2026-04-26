import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

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

  return (
    <div className={`relative group cursor-pointer overflow-hidden ${className} ${rounded ? 'rounded-full' : ''}`} onClick={handleClick}>
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover ${rounded ? 'rounded-full' : ''}`} 
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