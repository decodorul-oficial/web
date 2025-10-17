'use client';

import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        
        return (
          <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-900 bg-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-colors duration-200"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-body-${item.id}`}
            >
              <span className="font-semibold">{item.question}</span>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <div
              id={`accordion-body-${item.id}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
