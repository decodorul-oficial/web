'use client';


import { NewsItem } from '@/features/news/types';
import { HashtagSection } from './HashtagSection';
import { AutoScreenshot } from './AutoScreenshot';
import styles from './InstagramPreview.module.css';

interface InstagramPreviewProps {
  news: NewsItem;
}

interface NewsContent {
  synthesis?: string;
  summary?: string;
  description?: string;
  category?: string;
  type?: string;
}

export function InstagramPreview({ news }: InstagramPreviewProps) {
  // Extract synthesis from content if available
  const getSynthesis = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      return content.synthesis || content.summary || content.description || '';
    }
    return '';
  };

  const synthesis = getSynthesis();
  
  // Truncate synthesis to fit the card
  const truncatedSynthesis = synthesis.length > 250 
    ? synthesis.substring(0, 300) + '...' 
    : synthesis;

  // Extract category from content if available
  const getCategory = () => {
    if (typeof news.content === 'object' && news.content !== null) {
      const content = news.content as NewsContent;
      const rawCategory = content.category || content.type || '';
      // Capitalize first letter
      return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    }
    return '';
  };

  const category = getCategory();

  return (
    <div className="w-full max-w-md mx-auto">
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
              <span className={styles.brandName}>
                Monitorul Oficial
              </span>
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
            {truncatedSynthesis && (
              <p className={styles.synthesis}>
                {truncatedSynthesis}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerLeft}>
                <span className={styles.footerIcon}>📋</span>
                <span className={styles.footerText}>Monitorul Oficial</span>
              </div>
              <div className={styles.footerRight}>
                <span className="text-xs">Publicat:</span>
                <span className={styles.footerDate}>
                  {news.publicationDate ? new Date(news.publicationDate).toLocaleDateString('ro-RO') : 'Data indisponibilă'}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className={styles.decorativeElement1}></div>
          <div className={styles.decorativeElement2}></div>
        </div>
        </div>
      </AutoScreenshot>

      {/* Back Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          ← Înapoi la lista de știri
        </button>
      </div>

      {/* Hashtag Section */}
      <HashtagSection news={news} />
    </div>
  );
}
