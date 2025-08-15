# API Implementation Guide pentru Sistemul de Tracking al Vizualizărilor

## Prezentare Generală

Acest ghid descrie implementarea unui sistem de tracking pentru vizualizările știrilor în aplicația "Decodorul Oficial". Sistemul va permite afișarea știrilor cele mai citite bazate pe date reale de accesare.

## Modificări Necesare în API

### 1. Crearea Tabelei `news_views`

```sql
CREATE TABLE news_views (
  id SERIAL PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX idx_news_views_news_id ON news_views(news_id);
CREATE INDEX idx_news_views_ip_address ON news_views(ip_address);
CREATE INDEX idx_news_views_viewed_at ON news_views(viewed_at);
CREATE INDEX idx_news_views_news_ip_date ON news_views(news_id, ip_address, viewed_at);

-- Constraint pentru a preveni duplicatele din aceeași sursă în ultimele 24h
CREATE UNIQUE INDEX idx_news_views_unique_daily ON news_views(news_id, ip_address, DATE(viewed_at));
```

### 2. Adăugarea Câmpului `view_count` în Tabela `news`

```sql
-- Adaugă câmpul view_count dacă nu există
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Index pentru sortarea după view_count
CREATE INDEX IF NOT EXISTS idx_news_view_count ON news(view_count DESC);
```

### 3. Funcția pentru Incrementarea Vizualizărilor

```sql
CREATE OR REPLACE FUNCTION increment_news_view(
  p_news_id UUID,
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_view_id INTEGER;
  v_news_exists BOOLEAN;
BEGIN
  -- Verifică dacă știrea există
  SELECT EXISTS(SELECT 1 FROM news WHERE id = p_news_id) INTO v_news_exists;
  IF NOT v_news_exists THEN
    RETURN FALSE;
  END IF;

  -- Încearcă să insereze o nouă vizualizare
  INSERT INTO news_views (news_id, ip_address, user_agent, session_id)
  VALUES (p_news_id, p_ip_address, p_user_agent, p_session_id)
  ON CONFLICT (news_id, ip_address, DATE(viewed_at))
  DO NOTHING;

  -- Dacă s-a inserat o nouă vizualizare, incrementează contorul
  IF FOUND THEN
    UPDATE news 
    SET view_count = view_count + 1 
    WHERE id = p_news_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

### 4. Query pentru Știrile Cele Mai Cite

```sql
CREATE OR REPLACE FUNCTION get_most_read_news(
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_period TEXT DEFAULT 'week'
) RETURNS TABLE(
  id UUID,
  title TEXT,
  publication_date TIMESTAMP WITH TIME ZONE,
  content JSONB,
  filename TEXT,
  view_count INTEGER,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_news AS (
    SELECT 
      n.id,
      n.title,
      n.publication_date,
      n.content,
      n.filename,
      n.view_count,
      COUNT(*) OVER() as total_count
    FROM news n
    WHERE 
      CASE p_period
        WHEN 'day' THEN n.publication_date >= CURRENT_DATE
        WHEN 'week' THEN n.publication_date >= CURRENT_DATE - INTERVAL '7 days'
        WHEN 'month' THEN n.publication_date >= CURRENT_DATE - INTERVAL '30 days'
        WHEN 'year' THEN n.publication_date >= CURRENT_DATE - INTERVAL '365 days'
        ELSE TRUE -- 'all' - toate știrile
      END
      AND n.view_count > 0
  )
  SELECT 
    fn.id,
    fn.title,
    fn.publication_date,
    fn.content,
    fn.filename,
    fn.view_count,
    fn.total_count
  FROM filtered_news fn
  ORDER BY fn.view_count DESC, fn.publication_date DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

## Modificări în GraphQL Schema

### 1. Tipul `NewsView`

```graphql
type NewsView {
  id: ID!
  newsId: ID!
  ipAddress: String!
  userAgent: String
  viewedAt: DateTime!
  sessionId: String
}

input TrackNewsViewInput {
  newsId: ID!
  ipAddress: String!
  userAgent: String
  sessionId: String
}
```

### 2. Mutation pentru Tracking

```graphql
type Mutation {
  trackNewsView(input: TrackNewsViewInput!): NewsView!
}
```

### 3. Query pentru Most Read News

```graphql
type Query {
  getMostReadNews(
    limit: Int! = 10
    offset: Int! = 0
    period: String = "week"
  ): NewsListResponse!
}

type NewsListResponse {
  stiri: [News!]!
  pagination: PaginationInfo!
}

type News {
  id: ID!
  title: String!
  publicationDate: DateTime!
  content: JSON!
  filename: String
  viewCount: Int
  # ... alte câmpuri existente
}
```

## Implementarea în Resolvers

### 1. Resolver pentru `trackNewsView`

```typescript
const trackNewsView = async (_, { input }, { req }) => {
  const { newsId, ipAddress, userAgent, sessionId } = input;
  
  // Obține IP-ul real al clientului
  const clientIP = req.ip || req.connection.remoteAddress || ipAddress;
  
  try {
    // Execută funcția SQL pentru incrementarea vizualizării
    const result = await db.query(
      'SELECT increment_news_view($1, $2, $3, $4)',
      [newsId, clientIP, userAgent, sessionId]
    );
    
    if (result.rows[0].increment_news_view) {
      // Returnează informațiile despre vizualizare
      return {
        id: crypto.randomUUID(),
        newsId,
        viewedAt: new Date().toISOString()
      };
    }
    
    throw new Error('Failed to track news view');
  } catch (error) {
    console.error('Error tracking news view:', error);
    throw new Error('Failed to track news view');
  }
};
```

### 2. Resolver pentru `getMostReadNews`

```typescript
const getMostReadNews = async (_, { limit, offset, period = 'week' }) => {
  try {
    const result = await db.query(
      'SELECT * FROM get_most_read_news($1, $2, $3)',
      [limit, offset, period]
    );
    
    const stiri = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      publicationDate: row.publication_date,
      content: row.content,
      filename: row.filename,
      viewCount: row.view_count
    }));
    
    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    return {
      stiri,
      pagination: {
        totalCount,
        currentPage,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching most read news:', error);
    throw new Error('Failed to fetch most read news');
  }
};
```

## Modificări în Endpoint-ul de Vizualizare a Știrii

### 1. În resolver-ul `getStireById`

```typescript
const getStireById = async (_, { id }, { req }) => {
  try {
    // Obține știrea
    const news = await getNewsById(id);
    
    if (!news) {
      return null;
    }
    
    // Track view (opțional, poate fi făcut separat)
    // await trackNewsView({ newsId: id, ... });
    
    return news;
  } catch (error) {
    console.error('Error fetching news by id:', error);
    throw new Error('Failed to fetch news');
  }
};
```

## Considerații de Performanță

### 1. Cache-ing

```typescript
// Implementează cache pentru most read news
const getMostReadNewsWithCache = async (period: string) => {
  const cacheKey = `most_read_news:${period}`;
  
  // Încearcă să obții din cache
  let result = await redis.get(cacheKey);
  
  if (!result) {
    // Dacă nu există în cache, obține din DB
    result = await getMostReadNews(period);
    
    // Salvează în cache pentru 5 minute
    await redis.setex(cacheKey, 300, JSON.stringify(result));
  }
  
  return typeof result === 'string' ? JSON.parse(result) : result;
};
```

### 2. Background Jobs pentru Aggregare

```typescript
// Job pentru actualizarea view_count în background
const updateViewCounts = async () => {
  try {
    await db.query(`
      UPDATE news 
      SET view_count = (
        SELECT COUNT(*) 
        FROM news_views 
        WHERE news_views.news_id = news.id
      )
    `);
  } catch (error) {
    console.error('Error updating view counts:', error);
  }
};

// Rulează la fiecare 5 minute
setInterval(updateViewCounts, 5 * 60 * 1000);
```

## Testare

### 1. Test pentru Tracking

```typescript
describe('News View Tracking', () => {
  it('should track a new view', async () => {
    const result = await trackNewsView({
      newsId: 'test-news-id',
      ipAddress: '192.168.1.1',
      userAgent: 'test-agent'
    });
    
    expect(result.newsId).toBe('test-news-id');
  });
  
  it('should not track duplicate views from same IP in 24h', async () => {
    // Prima vizualizare
    await trackNewsView({
      newsId: 'test-news-id',
      ipAddress: '192.168.1.1'
    });
    
    // A doua vizualizare din aceeași zi
    const result = await trackNewsView({
      newsId: 'test-news-id',
      ipAddress: '192.168.1.1'
    });
    
    expect(result).toBeFalsy();
  });
});
```

### 2. Test pentru Most Read News

```typescript
describe('Most Read News', () => {
  it('should return news ordered by view count', async () => {
    const result = await getMostReadNews({ limit: 5, period: 'week' });
    
    expect(result.stiri).toHaveLength(5);
    expect(result.stiri[0].viewCount).toBeGreaterThanOrEqual(result.stiri[1].viewCount);
  });
});
```

## Deployment

### 1. Migrații

```bash
# Rulează migrațiile
psql -d your_database -f migrations/001_create_news_views.sql
psql -d your_database -f migrations/002_add_view_count.sql
psql -d your_database -f migrations/003_create_functions.sql
```

### 2. Verificări Post-Deployment

```sql
-- Verifică dacă tabelele au fost create
\dt news_views

-- Verifică dacă funcțiile există
\df increment_news_view
\df get_most_read_news

-- Testează funcționalitatea
SELECT increment_news_view('test-news-id'::uuid, '192.168.1.1'::inet);
SELECT * FROM get_most_read_news(5, 0, 'week');
```

## Monitorizare

### 1. Logs pentru Tracking

```typescript
// Adaugă logging pentru debugging
const trackNewsView = async (input) => {
  console.log('Tracking news view:', {
    newsId: input.newsId,
    ipAddress: input.ipAddress,
    timestamp: new Date().toISOString()
  });
  
  // ... restul logicii
};
```

### 2. Metrics

```typescript
// Track metrics pentru vizualizări
const trackMetrics = {
  totalViews: 0,
  uniqueIPs: new Set(),
  
  recordView: (ipAddress: string) => {
    this.totalViews++;
    this.uniqueIPs.add(ipAddress);
  }
};
```

## Concluzie

Această implementare oferă:

1. **Tracking precis** al vizualizărilor cu deduplicare pe IP
2. **Performanță optimizată** cu indexuri și cache
3. **Flexibilitate** în filtrarea perioadelor
4. **Scalabilitate** pentru volume mari de date
5. **Monitorizare** și debugging

Sistemul va permite afișarea știrilor cele mai citite bazate pe date reale, îmbunătățind experiența utilizatorilor și oferind insights valoroase despre conținutul popular.
