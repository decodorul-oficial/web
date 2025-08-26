'use client';

import { useState } from 'react';
import { NewsItem } from '@/features/news/types';

interface HashtagSectionProps {
  news: NewsItem;
}

export function HashtagSection({ news }: HashtagSectionProps) {
  const [copied, setCopied] = useState(false);

  // Extract keywords and category for hashtags
  const getHashtags = () => {
    const hashtags = ['#DecodorulOficial', '#MonitorulOficial', '#LegislațieRomână'];
    
    // Add category hashtag if available
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      const category = content.category || content.type || '';
      if (category) {
        const categoryHashtag = `#${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}`;
        hashtags.push(categoryHashtag);
      }
    }

    // Add keywords from content if available
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as any;
      if (content.keywords && Array.isArray(content.keywords)) {
        content.keywords.forEach((keyword: string) => {
          const hashtag = `#${keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()}`;
          if (!hashtags.includes(hashtag)) {
            hashtags.push(hashtag);
          }
        });
      }
    }

    // Add some general legal hashtags
    const generalHashtags = [
      '#GuvernRomânia',
      '#HotărâriGuvern',
      '#ActeNormative',
      '#Legislație',
      '#România'
    ];

    generalHashtags.forEach(hashtag => {
      if (!hashtags.includes(hashtag)) {
        hashtags.push(hashtag);
      }
    });

    return hashtags;
  };

  const hashtags = getHashtags();
  const hashtagText = hashtags.join(' ');
  
  // Create the official website link
  const officialLink = `https://decodoruloficial.ro/stiri/${news.id}`;
  
  // Combine hashtags and link for copying
  const fullTextToCopy = `${hashtagText}\n\n🔗 ${officialLink}`;

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy hashtags:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullTextToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
          📋 Hashtag-uri relevante
        </h3>
        <button
          onClick={handleCopyHashtags}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            copied 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-brand-info hover:bg-brand-highlight text-white'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copiat!
            </>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiază hashtag-uri
            </>
          )}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {hashtags.map((hashtag, index) => (
          <span
            key={index}
            className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white border border-gray-200 rounded-md text-xs sm:text-sm text-gray-700 font-medium"
          >
            {hashtag}
          </span>
        ))}
      </div>
      
      {/* Official Website Link */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🔗</span>
            <span className="text-xs sm:text-sm text-blue-700 font-medium">
              Link oficial:
            </span>
          </div>
          <a
            href={officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline break-all"
          >
            {officialLink}
          </a>
        </div>
      </div>
      
      <div className="mt-2 sm:mt-3 text-xs text-gray-500">
        💡 Click pe buton pentru a copia toate hashtag-urile și link-ul în clipboard
      </div>
    </div>
  );
}
