'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit3 } from 'lucide-react';

interface InlineEditableDisplayNameProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  placeholder?: string;
  className?: string;
}

export function InlineEditableDisplayName({ 
  value, 
  onSave, 
  placeholder = "Numele complet",
  className = ""
}: InlineEditableDisplayNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    // Validation
    if (trimmedValue.length < 2) {
      setError('Numele trebuie să aibă cel puțin 2 caractere');
      return;
    }
    
    if (trimmedValue.length > 100) {
      setError('Numele nu poate depăși 100 de caractere');
      return;
    }

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(trimmedValue);
      if (success) {
        setIsEditing(false);
      } else {
        setError('Eroare la salvarea numelui. Te rugăm să încerci din nou.');
      }
    } catch {
      setError('Eroare la salvarea numelui. Te rugăm să încerci din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Salvează"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Anulează"
        >
          <X className="w-4 h-4" />
        </button>
        {error && (
          <div className="absolute top-full left-0 mt-1 text-sm text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <span className="text-gray-900 flex-1">
        {value || 'Nu este specificat'}
      </span>
      <button
        onClick={handleStartEdit}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        title="Editează numele"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
}
