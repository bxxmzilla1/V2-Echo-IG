import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  /** When set, the span (non-editing) shows formatDisplay(value) but the input still edits the raw value. */
  formatDisplay?: (value: string) => string;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onChange, 
  className = "", 
  multiline = false,
  placeholder = "Edit...",
  formatDisplay,
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
          className={`w-full resize-none rounded-lg border border-sky-500/50 bg-zinc-900/90 p-1.5 text-zinc-100 shadow-inner shadow-black/20 outline-none ring-2 ring-sky-500/20 transition-shadow ${className}`}
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
        className={`min-w-[20px] rounded-md border border-sky-500/50 bg-zinc-900/90 px-1.5 text-zinc-100 shadow-inner shadow-black/20 outline-none ring-2 ring-sky-500/20 transition-shadow ${className}`}
      />
    );
  }

  const displayText = formatDisplay
    ? formatDisplay(localValue)
    : localValue;

  return (
    <span 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }} 
      className={`cursor-pointer whitespace-pre-wrap rounded px-0.5 transition-colors hover:bg-white/[0.07] ${className} ${!localValue ? 'opacity-50 italic' : ''}`}
    >
      {displayText || placeholder}
    </span>
  );
};
