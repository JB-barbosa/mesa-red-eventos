
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  disabled = false
}) => {
  const [selectedColor, setSelectedColor] = useState(color);
  const [customColor, setCustomColor] = useState(color);

  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE',
    '#A3E4D7', '#F9E79F', '#D7BDE2', '#A9DFBF', '#F5B7B1'
  ];

  useEffect(() => {
    setSelectedColor(color);
    setCustomColor(color);
  }, [color]);

  const handleColorSelect = (newColor: string) => {
    setSelectedColor(newColor);
    onChange(newColor);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setSelectedColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-12 h-8 p-0 border-2"
          style={{ backgroundColor: selectedColor }}
          disabled={disabled}
        >
          <span className="sr-only">Selecionar cor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Cores Predefinidas</h4>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorSelect(presetColor)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Cor Personalizada</h4>
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    handleColorSelect(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
