'use client';

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { X, Move, ZoomIn, ZoomOut, RotateCcw, Info, Eye, EyeOff } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-100 h-full rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 font-medium">Se încarcă graficul legislativ...</p>
      </div>
    </div>
  )
});

import { useGraphQL } from '@/hooks/useGraphQL';
import {
  GET_LEGISLATIVE_GRAPH,
  GetLegislativeGraphResponse
} from '@/features/news/graphql/legislativeNetworkQueries';

// Tipuri
interface LegislativeNetworkGraphProps {
  documentId: string;
}

interface GraphNode {
  id: string;
  title: string;
  publicationDate: string;
  type: string;
  val: number;
  color: string;
  isCentral: boolean;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  confidence: number;
  color: string;
  curvature?: number;
  particleSpeed?: number;
  particleWidth?: number;
}

interface LegendConfig {
  documentTypes: Array<{ color: string; label: string; type?: string }>;
  connectionTypes: Array<{ 
    color: string; 
    label: string; 
    style: 'solid' | 'dashed' | 'dotted';
    width: number;
  }>;
}

// Configurație culori și stiluri
const DOCUMENT_COLORS: Record<string, string> = {
  central: '#5bc0be',
  lege: '#059669',
  'ordonanta_urgenta': '#DC2626',
  'ordonanță de urgență': '#DC2626',
  'hotarare_guvern': '#7C3AED',
  'hotărâre de guvern': '#7C3AED',
  'ordin_ministru': '#2563EB',
  'ordin de ministru': '#2563EB',
  default: '#3a506b'
};

const CONNECTION_COLORS: Record<string, string> = {
  'modifică': '#059669',
  'modifica': '#059669',
  'abrogă': '#DC2626',
  'abroga': '#DC2626',
  'face referire la': '#6B7280',
  'referire': '#6B7280',
  default: '#3a506b'
};

const LEGEND_CONFIG: LegendConfig = {
  documentTypes: [
    { color: DOCUMENT_COLORS.central, label: 'Document central' },
    { color: DOCUMENT_COLORS.lege, label: 'Lege' },
    { color: DOCUMENT_COLORS['ordonanta_urgenta'], label: 'Ordonanță de urgență' },
    { color: DOCUMENT_COLORS['hotarare_guvern'], label: 'Hotărâre de guvern' },
    { color: DOCUMENT_COLORS['ordin_ministru'], label: 'Ordin de ministru' }
  ],
  connectionTypes: [
    { 
      color: CONNECTION_COLORS['modifică'], 
      label: 'Modifică', 
      style: 'solid',
      width: 3
    },
    { 
      color: CONNECTION_COLORS['abrogă'], 
      label: 'Abrogă', 
      style: 'solid',
      width: 3
    },
    { 
      color: CONNECTION_COLORS['face referire la'], 
      label: 'Conexiune dedusă', 
      style: 'dashed',
      width: 1
    }
  ]
};

export const LegislativeNetworkGraph = React.forwardRef<
  HTMLDivElement,
  LegislativeNetworkGraphProps
>(({ documentId }, ref) => {
  const router = useRouter();
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const frameCount = useRef(0);

  // Responsive dimensions
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ 
        width: Math.max(width - 32, 100), 
        height: Math.max(height - 32, 100) 
      });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Debug: Check graphRef state after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Component mounted, graphRef.current =', graphRef.current);
      if (graphRef.current) {
        console.log('graphRef.current methods:', Object.getOwnPropertyNames(graphRef.current));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Debug: Monitor when graphRef.current changes
  useEffect(() => {
    console.log('graphRef.current changed to:', graphRef.current);
    if (graphRef.current) {
      console.log('graphRef.current methods available:', Object.getOwnPropertyNames(graphRef.current));
    }
  }, [graphRef.current]);

  // GraphQL data
  const stableVariables = useMemo(
    () => ({ documentId, depth: 3 }),
    [documentId]
  );

  const { data, loading, error } = useGraphQL<GetLegislativeGraphResponse>(
    GET_LEGISLATIVE_GRAPH,
    stableVariables,
    { skip: false }
  );

  // Process graph data
  const graphData = useMemo(() => {
    const sourceData = data?.getLegislativeGraph;
    if (!sourceData) return { nodes: [], links: [] };

    const centralNodeId = documentId;
    const nodeCount = sourceData.nodes.length;
    
    // Process nodes
    const nodes: GraphNode[] = sourceData.nodes.map((node: any, idx: number) => {
      const isCentral = node.id === centralNodeId;
      const typeKey = node.type?.toLowerCase() || 'default';
      
      let color = DOCUMENT_COLORS.default;
      if (isCentral) {
        color = DOCUMENT_COLORS.central;
      } else {
        for (const [key, value] of Object.entries(DOCUMENT_COLORS)) {
          if (typeKey.includes(key.replace('_', ' '))) {
            color = value;
            break;
          }
        }
      }

      // Circular layout with better spacing
      let x = 0, y = 0;
      if (!isCentral) {
        const angle = (idx * 2 * Math.PI) / (nodeCount - 1);
        const radius = Math.min(200, Math.max(150, nodeCount * 15));
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }

      return {
        ...node,
        val: isCentral ? 40 : 20,
        color,
        isCentral,
        x,
        y,
        fx: isCentral ? 0 : undefined,
        fy: isCentral ? 0 : undefined
      };
    });

    // Process links with proper styling
    const links: GraphLink[] = sourceData.links.map((link: any, idx: number) => {
      const confidence = link.confidence || 0.5;
      const typeKey = link.type?.toLowerCase() || 'default';
      
      let color = CONNECTION_COLORS.default;
      for (const [key, value] of Object.entries(CONNECTION_COLORS)) {
        if (typeKey.includes(key)) {
          color = value;
          break;
        }
      }

      // Add curvature for multiple links between same nodes
      const linkKey = `${link.source}_${link.target}`;
      const reverseKey = `${link.target}_${link.source}`;
      const existingLinks = sourceData.links.filter((l: any) => 
        (l.source === link.source && l.target === link.target) ||
        (l.source === link.target && l.target === link.source)
      );
      
      let curvature = 0;
      if (existingLinks.length > 1) {
        const linkIndex = existingLinks.findIndex((l: any) => l === link);
        curvature = 0.3 * (linkIndex - (existingLinks.length - 1) / 2);
      }

      return {
        ...link,
        color,
        confidence,
        curvature,
        particleSpeed: confidence >= 0.8 ? 0.01 : 0,
        particleWidth: confidence >= 0.8 ? 4 : 2
      };
    });

    return { nodes, links };
  }, [data, documentId]);

  // Handle node interactions
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.id === documentId) {
        setSelectedNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
      } else {
        setSelectedNode(node.id);
        router.push(`/stiri/${node.id}`);
      }
    },
    [router, documentId]
  );

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
    
    if (node) {
      const connectedNodes = new Set<string>();
      const connectedLinks = new Set<string>();
      
      graphData.links.forEach(link => {
        const source = typeof link.source === 'object' ? link.source.id : link.source;
        const target = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (source === node.id || target === node.id) {
          connectedNodes.add(source);
          connectedNodes.add(target);
          connectedLinks.add(`${source}-${target}`);
        }
      });
      
      setHighlightNodes(connectedNodes);
      setHighlightLinks(connectedLinks);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [graphData.links]);

  // Update tooltip position
  useEffect(() => {
    if (!hoveredNode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredNode]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoom(1.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoom(0.67, 300);
  }, []);

  const handleResetView = useCallback(() => {
    console.log('handleResetView called:', {
      graphRefCurrent: graphRef.current,
      graphRefType: typeof graphRef.current,
      hasZoomToFit: graphRef.current?.zoomToFit ? 'yes' : 'no',
      nodesLength: graphData.nodes.length
    });
    
    if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
      try {
        graphRef.current.zoomToFit(400, 50);
        console.log('Reset view successful');
      } catch (error) {
        console.warn('Failed to reset view:', error);
        // Fallback: try to center the view
        if (graphRef.current.centerAt && typeof graphRef.current.centerAt === 'function') {
          graphRef.current.centerAt(0, 0, 1000);
        }
      }
    } else {
      console.log('Reset view skipped - graphRef.current is not ready');
    }
  }, [graphData.nodes.length]);

  // Initial zoom to fit
  useEffect(() => {
    if (!graphRef.current || graphData.nodes.length === 0) return;
    
    const timer = setTimeout(() => {
      if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
        try {
          graphRef.current.zoomToFit(400, 50);
          console.log('Initial zoom successful');
        } catch (error) {
          console.warn('Failed to perform initial zoom:', error);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [graphData.nodes.length]);

  // Configure D3 forces
  useEffect(() => {
    if (!graphRef.current || graphData.nodes.length === 0) return;
    
    const fg = graphRef.current;
    
    try {
      // Configure forces for better layout
      fg.d3Force('link')
        ?.distance((link: any) => {
          const confidence = link.confidence || 0.5;
          return 150 + (1 - confidence) * 100;
        })
        .strength(1);
      
      fg.d3Force('charge')?.strength(-500).distanceMax(300);
      fg.d3Force('center')?.strength(0.1);
      fg.d3Force('collision')?.radius(30);
      
      fg.d3ReheatSimulation();
      console.log('D3 forces configured successfully');
    } catch (error) {
      console.warn('Failed to configure D3 forces:', error);
    }
  }, [graphData]);

  // Error and loading states
  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Se încarcă conexiunile legislative...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold mb-2">Eroare la încărcarea graficului</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!graphData.nodes.length) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-600">Nu există conexiuni legislative pentru acest document.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-lg h-[600px] overflow-hidden"
    >
      {/* Legend Panel */}
      {showLegend && (
        <div className="absolute left-4 top-4 z-20 bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-xl p-4 w-72 max-h-[calc(100%-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Legenda graficului</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              aria-label="Închide legenda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Document Types */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              Tipuri de documente
            </h4>
            <div className="space-y-2">
              {LEGEND_CONFIG.documentTypes.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 group">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Types */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              Tipuri de conexiuni
            </h4>
            <div className="space-y-2">
              {LEGEND_CONFIG.connectionTypes.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 group">
                  <svg width="32" height="4" className="flex-shrink-0">
                    <line
                      x1="0"
                      y1="2"
                      x2="32"
                      y2="2"
                      stroke={item.color}
                      strokeWidth={item.width}
                      strokeDasharray={item.style === 'dashed' ? '5,5' : item.style === 'dotted' ? '2,2' : '0'}
                    />
                  </svg>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Încredere:</span> Liniile solide indică conexiuni explicite (≥60%), 
                  iar cele punctate conexiuni deduse (&lt;60%)
                </p>
              </div>
            </div>
          </div>

          {/* Interaction Instructions */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              Instrucțiuni
            </h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <Move className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Click + drag pentru navigare</span>
              </div>
              <div className="flex items-start space-x-3">
                <ZoomIn className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Scroll sau butoane pentru zoom</span>
              </div>
              <div className="flex items-start space-x-3">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Hover pentru evidențiere conexiuni</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xs ml-7 text-gray-600">Click pe nod pentru detalii</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute right-4 top-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all group"
          title="Mărește"
        >
          <ZoomIn className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all group"
          title="Micșorează"
        >
          <ZoomOut className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all group"
          title="Resetează vizualizarea"
        >
          <RotateCcw className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
        </button>
      </div>

      {/* Toggle Legend Button */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute left-4 top-4 z-20 bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Afișează legenda</span>
        </button>
      )}

      {/* Graph Container */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        onEngineStop={() => {
          console.log('ForceGraph2D engine stopped, graphRef.current =', graphRef.current);
          if (graphRef.current) {
            console.log('Engine stopped, graphRef methods:', Object.getOwnPropertyNames(graphRef.current));
          }
        }}
        nodeLabel={() => ''}
        onNodeClick={(node: any) => handleNodeClick(node as GraphNode)}
        onNodeHover={(node: any) => handleNodeHover(node as GraphNode | null)}
        backgroundColor="transparent"
        linkDirectionalParticles={(link: any) => {
          const l = link as GraphLink;
          return l.confidence >= 0.8 ? 2 : 0;
        }}
        linkDirectionalParticleSpeed={(link: any) => {
          const l = link as GraphLink;
          return l.particleSpeed || 0.005;
        }}
        linkDirectionalParticleWidth={(link: any) => {
          const l = link as GraphLink;
          return l.particleWidth || 2;
        }}
        linkDirectionalParticleColor={() => '#06b6d4'}
        linkCurvature={(link: any) => (link as GraphLink).curvature || 0}
        linkCanvasObjectMode={() => 'after'}
        nodeCanvasObjectMode={() => 'after'}
        onRenderFramePost={(ctx: CanvasRenderingContext2D) => {
          // Log first few frames to see when graph is ready
          if (frameCount.current < 5) {
            console.log(`Frame ${frameCount.current}: graphRef.current =`, graphRef.current);
          }
          frameCount.current++;
        }}
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const l = link as GraphLink;
          const source = l.source as GraphNode;
          const target = l.target as GraphNode;
          
          if (!source || !target || !source.x || !source.y || !target.x || !target.y) return;

          const linkKey = `${source.id}-${target.id}`;
          const isHighlighted = highlightLinks.has(linkKey) || highlightLinks.has(`${target.id}-${source.id}`);
          
          ctx.save();
          
          // Fade non-highlighted links when hovering
          if (highlightNodes.size > 0 && !isHighlighted) {
            ctx.globalAlpha = 0.1;
          }
          
          // Draw link
          ctx.beginPath();
          
          // Handle curvature
          if (l.curvature) {
            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const norm = Math.sqrt(dx * dx + dy * dy);
            const unitX = -dy / norm;
            const unitY = dx / norm;
            const offset = l.curvature * norm * 0.5;
            const cx = mx + offset * unitX;
            const cy = my + offset * unitY;
            
            ctx.moveTo(source.x, source.y);
            ctx.quadraticCurveTo(cx, cy, target.x, target.y);
          } else {
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
          }
          
          // Style based on confidence
          ctx.strokeStyle = l.color;
          ctx.lineWidth = isHighlighted ? 3 : (l.confidence >= 0.8 ? 2 : 1);
          
          if (l.confidence < 0.6) {
            ctx.setLineDash([5, 5]);
          } else {
            ctx.setLineDash([]);
          }
          
          ctx.stroke();
          ctx.restore();
        }}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const n = node as GraphNode;
          if (!n.x || !n.y) return;
          
          const isHighlighted = highlightNodes.has(n.id);
          const label = n.title.length > 30 ? n.title.slice(0, 30) + '…' : n.title;
          const fontSize = n.isCentral ? 14 / globalScale : 12 / globalScale;
          
          ctx.save();
          
          // Fade non-highlighted nodes when hovering
          if (highlightNodes.size > 0 && !isHighlighted) {
            ctx.globalAlpha = 0.1;
          }
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.val, 0, 2 * Math.PI);
          ctx.fillStyle = n.color;
          ctx.fill();
          
          // Add border for central node or highlighted
          if (n.isCentral || isHighlighted) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
          
          // Draw label background
          ctx.font = `${n.isCentral ? 'bold ' : ''}${fontSize}px Inter, system-ui, sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth + 10, fontSize + 10];
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(
            n.x - bckgDimensions[0] / 2,
            n.y + n.val + 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );
          
          // Draw label text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = n.isCentral ? n.color : '#111827';
          ctx.fillText(label, n.x, n.y + n.val + 2 + bckgDimensions[1] / 2);
          
          ctx.restore();
        }}
        minZoom={0.5}
        maxZoom={5}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTicks={100}
        warmupTicks={100}
      />

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 bg-white p-3 rounded-lg shadow-2xl border border-gray-200 text-sm pointer-events-none max-w-sm transform -translate-y-full"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
          }}
        >
          <div className="font-semibold text-gray-900 mb-1 break-words">
            {hoveredNode.title}
          </div>
          <div className="text-gray-600 text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Tip:</span>
              <span className="capitalize">{hoveredNode.type?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Publicat:</span>
              <span>
                {new Date(hoveredNode.publicationDate).toLocaleDateString('ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          {hoveredNode.id !== documentId && (
            <div className="text-blue-600 text-xs mt-2 font-medium border-t border-gray-100 pt-2">
              Click pentru a vizualiza documentul
            </div>
          )}
        </div>
      )}
    </div>
  );
});

LegislativeNetworkGraph.displayName = 'LegislativeNetworkGraph';