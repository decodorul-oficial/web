'use client';

import { useState, useEffect, useRef } from 'react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className = '' }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract headings from the page
    const headings = document.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      // Try to find the parent section with an ID
      const parentSection = heading.closest('section[id]');
      const sectionId = parentSection?.id;
      
      // Create unique ID by combining section ID with heading index if needed
      let uniqueId = sectionId || heading.id || `heading-${index}`;
      
      // If we have a section ID, add heading index to make it unique
      if (sectionId && !heading.id) {
        uniqueId = `${sectionId}-heading-${index}`;
      }
      
      return {
        id: uniqueId,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)) - 1, // h2 = 1, h3 = 2
      };
    });

    setTocItems(items);

    // Set up intersection observer for active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    // Observe sections instead of headings
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle scroll to make TOC sticky
  useEffect(() => {
    const handleScroll = () => {
      // Get header height from CSS variable or fallback to 80px
      const headerElement = document.querySelector('header');
      const headerHeight = headerElement ? headerElement.offsetHeight : 80;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Make sticky when scrolled past header
      setIsSticky(scrollTop > headerHeight);
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // Extract the original section ID (remove -heading-X suffix if present)
    const sectionId = id.replace(/-heading-\d+$/, '');
    const element = document.getElementById(sectionId);
    if (element) {
      // Scroll to the element, then adjust by -50px offset
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // Auto-close after clicking a section
      setIsOpen(false);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={`${isSticky ? 'fixed top-16 left-4 right-4 z-40 max-w-4xl mx-auto' : 'relative'} transition-all duration-300 ${className}`} ref={tocRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gradient-to-r from-brand-info to-brand-accent text-white px-4 py-2
          ${isSticky 
            ? 'rounded-b-lg rounded-t-none opacity-70 hover:opacity-100'
            : 'rounded-lg opacity-100'
          }
          shadow-md hover:from-brand-info/90 hover:to-brand-accent/90 flex items-center justify-between
          ${isSticky ? 'shadow-lg' : ''}
          transition-all duration-300 ease-in-out`}
      >
        <span className="text-sm font-medium">Cuprins</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className={`${isSticky ? 'absolute' : 'absolute'} top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left text-sm py-2 px-3 rounded transition-colors duration-200 ${
                  activeId === item.id
                    ? 'bg-gradient-to-r from-brand-info to-brand-accent text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{
                  paddingLeft: `${item.level * 12 + 12}px`,
                }}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
