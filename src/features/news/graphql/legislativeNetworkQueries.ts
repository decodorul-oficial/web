// Query pentru graful conexiunilor legislative
export const GET_LEGISLATIVE_GRAPH = `
  query GetLegislativeGraph($documentId: ID!, $depth: Int) {
    getLegislativeGraph(documentId: $documentId, depth: $depth) {
      nodes {
        id
        title
        publicationDate
        type
      }
      links {
        source
        target
        type
        confidence
      }
    }
  }
`;

// Query pentru statisticile conexiunilor legislative
export const GET_LEGISLATIVE_CONNECTION_STATS = `
  query GetLegislativeConnectionStats {
    getLegislativeConnectionStats {
      totalConnections
      connectionsByType
      averageConfidence
    }
  }
`;

// Tipuri TypeScript pentru răspunsurile GraphQL
export interface LegislativeNode {
  id: string;
  title: string;
  publicationDate: string;
  type: string;
}

export interface LegislativeLink {
  source: string;
  target: string;
  type: string;
  confidence: number;
}

export interface LegislativeGraphData {
  nodes: LegislativeNode[];
  links: LegislativeLink[];
}

export interface LegislativeConnectionStats {
  totalConnections: number;
  connectionsByType: Record<string, number>;
  averageConfidence: number;
}

export interface GetLegislativeGraphResponse {
  getLegislativeGraph: LegislativeGraphData;
}

export interface GetLegislativeConnectionStatsResponse {
  getLegislativeConnectionStats: LegislativeConnectionStats;
}
