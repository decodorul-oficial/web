'use client';


import { NewsItem } from '@/features/news/types';
import { AutoScreenshot } from './AutoScreenshot';
import styles from './InstagramPreview.module.css';
import { useMemo } from 'react';

interface InstagramPreviewProps {
  news: NewsItem;
}

interface NewsContent {
  keywords?: string[];
  lucide_icon?: string;
  body?: string;
  summary?: string;
  author?: string;
  category?: string;
  type?: string;
}

export function InstagramPreview({ news }: InstagramPreviewProps) {
  // Extract synthesis from content if available
  const getPropertyFromNewsContent = (key: keyof NewsContent): string => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      const value = content[key] || '';
      switch (key) {
        case 'category':
          if (typeof value === 'string' && value.length > 0) {
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          }
          return '';
        default:
          return typeof value === 'string' ? value : '';
      }
    }
    return '';
  };

  const synthesis = getPropertyFromNewsContent('summary');
  const category = getPropertyFromNewsContent('category');
  const body = getPropertyFromNewsContent('body');
  const keywords = getPropertyFromNewsContent('keywords');
  const author = getPropertyFromNewsContent('author');

      // Truncate synthesis to fit the card
      const truncatedSynthesis = synthesis.length > 250 
        ? synthesis.substring(0, 1200) + '...' 
        : synthesis;
  // Truncate synthesis to fit the card
  // Parse HTML string, extract text content, truncate, then re-apply basic formatting


  function truncateHtmlText(html: string, maxLength: number): string {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Get the plain text content
    const text = tempDiv.textContent || tempDiv.innerText || '';
    // Truncate the text
    const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    // Optionally, wrap in <p> for basic formatting
    return `<p>${truncated.replace(/\n/g, '<br/>')}</p>`;
  }

  const truncatedBody = useMemo(() => {
    if (!body) return '';
    return truncateHtmlText(body, 750);
  }, [body]);
  
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Instagram Card - Optimized for Screenshot */}
      <AutoScreenshot filename={`instagram-${news.id}`}>
        <div className={styles.instagramCard}>
        
        {/* Background Gradient - Simplified for better rendering */}
        <div className={styles.backgroundGradient}></div>
        
        {/* Content Container */}
        <div className={styles.contentContainer}>
          
          {/* Header with Logo and Category */}
          <div className={styles.header}>
            {/* Logo */}
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <span className="text-brand text-sm font-bold">📋</span>
              </div>
              {/*<span className={styles.brandName}>
                Decodorul Oficial
              </span>*/}
            </div>
            
            {/* Category Badge */}
            {category && (
              <div className={styles.categoryBadge}>
                {category}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Title */}
            <h1 className={styles.title}>
              {news.title}
            </h1>
            
            {/* Synthesis */}
            {/* {truncatedSynthesis && (
              <p className={styles.synthesis}>
                {truncatedSynthesis}
              </p>
            )} */}
            {body && (
              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: truncatedBody }}
              />
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerLeft}>
                <span className={styles.footerIcon}>📋</span>
                <span className={styles.footerText}>{author}</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className={styles.decorativeElement1}></div>
          <div className={styles.decorativeElement2}></div>
        </div>
        </div>
      </AutoScreenshot>

    </div>
  );
}
