import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onChange, 
  className = "", 
  multiline = false,
  placeholder = "Edit..."
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          // @ts-ignore
          ref={inputRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className={`bg-gray-800/50 text-white p-1 rounded outline-none resize-none w-full border border-blue-500 ${className}`}
          rows={3}
        />
      );
    }
    return (
      <input
        // @ts-ignore
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-gray-800/50 text-white px-1 rounded outline-none min-w-[20px] border border-blue-500 ${className}`}
      />
    );
  }

  return (
    <span 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }} 
      className={`cursor-pointer hover:bg-white/10 hover:rounded px-0.5 transition-colors whitespace-pre-wrap ${className} ${!localValue ? 'opacity-50 italic' : ''}`}
    >
      {localValue || placeholder}
    </span>
  );
};
