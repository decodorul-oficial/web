'use client';

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect
} from 'react';
import { useRouter } from 'next/navigation';
import { X, Move, ZoomIn, ZoomOut, RotateCcw, Info, Eye } from 'lucide-react';
import type { Core } from 'cytoscape';

import { useGraphQL } from '@/hooks/useGraphQL';
import {
  GET_LEGISLATIVE_GRAPH,
  GetLegislativeGraphResponse,
  LegislativeNode,
  LegislativeLink
} from '@/features/news/graphql/legislativeNetworkQueries';

// Tipuri
interface LegislativeNetworkGraphProps {
  documentId: string;
}

// Culori pentru noduri
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

// Culori pentru confidence level
const CONFIDENCE_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high: '#059669',    // Verde
  medium: '#F59E0B',  // Portocaliu/Galben
  low: '#DC2626'      // Roșu
};

let cytoscapePromise: Promise<any> | null = null;

async function loadCytoscape() {
  if (!cytoscapePromise) {
    cytoscapePromise = (async () => {
      const cytoscapeModule = await import('cytoscape');
      const cytoscape = (cytoscapeModule as any).default || cytoscapeModule;
      const coseBilkentModule = await import('cytoscape-cose-bilkent');
      const colaModule = await import('cytoscape-cola');
      const dagreModule = await import('cytoscape-dagre');

      cytoscape.use((coseBilkentModule as any).default || coseBilkentModule);
      cytoscape.use((colaModule as any).default || colaModule);
      cytoscape.use((dagreModule as any).default || dagreModule);

      return cytoscape;
    })();
  }

  return cytoscapePromise;
}

export function LegislativeNetworkGraph({ documentId }: LegislativeNetworkGraphProps) {
  const router = useRouter();
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const hoveredNodeRef = useRef<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);
  const [layoutName, setLayoutName] = useState<'concentric' | 'breadthfirst' | 'cose'>('concentric');

  // Responsive dimensions
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ 
        width: Math.max(width - 32, 100), 
        height: Math.max(height - 32, 100) 
      });
      
      // Resize cytoscape
      if (cyRef.current) {
        cyRef.current.resize();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // GraphQL data - reduc depth pentru a evita 429 errors
  const stableVariables = useMemo(
    () => ({ documentId, depth: 2 }),
    [documentId]
  );

  const { data, loading, error } = useGraphQL<GetLegislativeGraphResponse>(
    GET_LEGISLATIVE_GRAPH,
    stableVariables,
    { skip: false }
  );

  // Process graph data for Cytoscape
  const graphData = useMemo(() => {
    const sourceData = data?.getLegislativeGraph;
    if (!sourceData) return { nodes: [], edges: [] };

    const centralNodeId = documentId;
    const originalNodeCount = sourceData.nodes.length;
    const originalLinkCount = sourceData.links.length;
    
    const isRareCase = originalNodeCount <= 2;
    const isManyNodes = originalNodeCount > 50;
    const isVeryCrowded = originalNodeCount > 100 || originalLinkCount > 200;
    
    // Filtrare agresivă pentru cazuri foarte aglomerate
    let nodesToProcess = sourceData.nodes;
    let linksToProcess = sourceData.links;
    
    if (isVeryCrowded) {
      const MAX_NODES = 80;
      const centralNode = nodesToProcess.find(n => n.id === centralNodeId);
      const otherNodes = nodesToProcess.filter(n => n.id !== centralNodeId);
      
      const nodeConnectionCount = new Map<string, number>();
      sourceData.links.forEach((link: LegislativeLink) => {
        nodeConnectionCount.set(link.source, (nodeConnectionCount.get(link.source) || 0) + 1);
        nodeConnectionCount.set(link.target, (nodeConnectionCount.get(link.target) || 0) + 1);
      });
      
      const sortedOtherNodes = otherNodes.sort((a, b) => {
        const countA = nodeConnectionCount.get(a.id) || 0;
        const countB = nodeConnectionCount.get(b.id) || 0;
        return countB - countA;
      });
      
      nodesToProcess = centralNode 
        ? [centralNode, ...sortedOtherNodes.slice(0, MAX_NODES - 1)]
        : sortedOtherNodes.slice(0, MAX_NODES);
      
      const nodeIds = new Set(nodesToProcess.map(n => n.id));
      linksToProcess = sourceData.links.filter((link: LegislativeLink) => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
      );
      
      if (linksToProcess.length > 150) {
        linksToProcess = linksToProcess
          .filter((link: LegislativeLink) => {
            const confidence = link.confidence || 0;
            const level = link.confidenceLevel;
            return level === 'high' || level === 'medium' || confidence >= 0.6;
          })
          .sort((a: LegislativeLink, b: LegislativeLink) => {
            const confA = a.confidence || 0;
            const confB = b.confidence || 0;
            return confB - confA;
          })
          .slice(0, 150);
      }
    }
    
    // Convert to Cytoscape format
    const nodes = nodesToProcess.map((node: LegislativeNode) => {
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

      let nodeSize = isCentral ? 50 : 30;
      if (isRareCase) {
        nodeSize = isCentral ? 60 : 40;
      } else if (isManyNodes) {
        nodeSize = isCentral ? 40 : 20;
      }

      return {
        data: {
          id: String(node.id),
          label: node.shortTitle || node.title,
          fullLabel: node.shortTitle || node.title,
          actNumber: node.actNumber,
          actType: node.actType || node.type,
          publicationDate: node.publicationDate,
          isCentral: String(isCentral),
          nodeType: node.type,
          color,
          size: nodeSize,
          fontSize: `${isCentral ? (isRareCase ? 16 : 14) : (isRareCase ? 14 : 12)}px`,
          textMaxWidth: isRareCase ? '100px' : (nodeSize > 30 ? '80px' : '60px'),
          borderWidth: isCentral ? 3 : 1,
          fontWeight: isCentral ? 'bold' : 'normal'
        }
      };
    });

    const edges = linksToProcess.map((link: LegislativeLink) => {
      const confidence = link.confidence || 0.5;
      const level = link.confidenceLevel || (confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low');
      
      let color = CONFIDENCE_COLORS[level];
      if (!color && link.confidenceLevel) {
        color = CONFIDENCE_COLORS[link.confidenceLevel];
      }

      return {
        data: {
          id: `${link.source}-${link.target}`,
          source: String(link.source),
          target: String(link.target),
          type: link.typeLabel || link.type,
          confidence: String(confidence),
          confidenceLevel: level,
          confidenceLabel: link.confidenceLabel,
          description: link.description,
          color,
          width: confidence >= 0.8 ? 3 : confidence >= 0.6 ? 2 : 1,
          opacity: level === 'low' ? 0.4 : level === 'medium' ? 0.7 : 1,
          lineStyle: level === 'low' ? 'dashed' : 'solid'
        }
      };
    });

    return { nodes, edges, filteredInfo: isVeryCrowded ? {
      originalNodes: originalNodeCount,
      displayedNodes: nodes.length,
      originalLinks: originalLinkCount,
      displayedLinks: edges.length
    } : null };
  }, [data, documentId]);

  // Cytoscape stylesheet
  const stylesheet = useMemo(() => [
    {
      selector: 'node',
      style: {
        'width': 'data(size)',
        'height': 'data(size)',
        'background-color': 'data(color)',
        'label': 'data(label)',
        'font-size': 'data(fontSize)',
        'text-wrap': 'wrap',
        'text-max-width': 'data(textMaxWidth)',
        'text-overflow-wrap': 'ellipsis',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#111827',
        'font-family': 'Inter, system-ui, sans-serif',
        'font-weight': 'data(fontWeight)',
        'border-width': 'data(borderWidth)',
        'border-color': '#fff',
        'text-outline-color': '#fff',
        'text-outline-width': 2
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#3b82f6'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(width)',
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5,
        'curve-style': 'bezier',
        'opacity': 'data(opacity)',
        'line-style': 'data(lineStyle)',
        'line-dash-pattern': [5, 5]
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'width': 4,
        'opacity': 1
      }
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.1
      }
    },
    {
      selector: '.highlighted-node',
      style: {
        'border-width': 4,
        'border-color': '#3b82f6',
        'opacity': 1
      }
    },
    {
      selector: '.highlighted-edge',
      style: {
        'width': 4,
        'opacity': 1
      }
    }
  ], []);

  // Layout configuration
  const layoutConfig = useMemo(() => {
    const nodeCount = graphData.nodes.length;
    
    if (layoutName === 'concentric') {
      return {
        name: 'concentric',
        concentric: (node: any) => node.data('isCentral') === 'true' ? 0 : 1,
        levelWidth: () => 2,
        minNodeSpacing: nodeCount <= 2 ? 200 : nodeCount <= 10 ? 150 : nodeCount > 50 ? 80 : 100,
        spacingFactor: nodeCount <= 2 ? 3 : nodeCount > 50 ? 1.2 : 2,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 50
      };
    }
    
    if (layoutName === 'breadthfirst') {
      // Find central node ID
      const centralNode = graphData.nodes.find((n: any) => n.data.isCentral === 'true');
      return {
        name: 'breadthfirst',
        roots: centralNode ? `#${centralNode.data.id}` : undefined,
        spacingFactor: nodeCount <= 2 ? 2 : nodeCount > 50 ? 1 : 1.5,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 50
      };
    }
    
    // cose (force-directed)
    return {
      name: 'cose',
      nodeRepulsion: nodeCount <= 2 ? 4000 : nodeCount > 50 ? 10000 : 6000,
      idealEdgeLength: nodeCount <= 2 ? 200 : nodeCount > 50 ? 80 : 150,
      animate: true,
      animationDuration: 1000,
      fit: true,
      padding: 50
    };
  }, [layoutName, graphData.nodes.length]);

  useEffect(() => {
    hoveredNodeRef.current = hoveredNode;
  }, [hoveredNode]);

  useEffect(() => {
    let cancelled = false;

    const renderGraph = async () => {
      if (!graphContainerRef.current) return;

      const cytoscape = await loadCytoscape();
      if (cancelled || !graphContainerRef.current) return;

      let cy = cyRef.current;

      if (!cy) {
        const newCy = cytoscape({
          container: graphContainerRef.current,
          elements: [],
          style: stylesheet,
          layout: { name: 'preset' },
          wheelSensitivity: 0.2,
          boxSelectionEnabled: false
        });
        cyRef.current = newCy;
        cy = newCy;

        newCy.on('tap', 'node', (evt: any) => {
          const nodeId = evt.target.id();
          if (nodeId === documentId) {
            newCy.elements().removeClass('faded highlighted-node highlighted-edge');
            setHoveredNode(null);
          } else {
            router.push(`/stiri/${nodeId}`);
          }
        });

        newCy.on('mouseover', 'node', (evt: any) => {
          const node = evt.target;
          setHoveredNode(node.id());
          newCy.elements().addClass('faded');
          node.removeClass('faded').addClass('highlighted-node');
          node.connectedEdges().removeClass('faded').addClass('highlighted-edge');
          node.connectedNodes().removeClass('faded').addClass('highlighted-node');
        });

        newCy.on('mouseout', 'node', () => {
          setHoveredNode(null);
          newCy.elements().removeClass('faded highlighted-node highlighted-edge');
        });

        newCy.on('mousemove', (evt: any) => {
          if (hoveredNodeRef.current) {
            setTooltipPosition({ x: evt.originalEvent.clientX, y: evt.originalEvent.clientY });
          }
        });
      } else if (cy.container() !== graphContainerRef.current) {
        cy.mount(graphContainerRef.current);
      }

      if (!cy) return;

      cy.batch(() => {
        cy.elements().remove();
        cy.add([...graphData.nodes, ...graphData.edges]);
        cy.style().fromJson(stylesheet as any);
      });

      cy.elements().removeClass('faded highlighted-node highlighted-edge');

      cy.resize();

      const layout = cy.layout({
        ...layoutConfig,
        animate: true,
        animationDuration: 800
      } as any);
      layout.run();

      cy.fit(undefined, 50);
    };

    renderGraph();

    return () => {
      cancelled = true;
    };
  }, [graphData, stylesheet, layoutConfig, dimensions.width, dimensions.height, documentId, router]);

  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
      cyRef.current.center();
    }
  }, []);

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
    // Check if it's a 429 error (rate limit)
    const isRateLimit = error.message?.includes('429') || error.message?.includes('Too Many Requests');
    
    return (
      <div className="h-[600px] flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600 max-w-md px-4">
          <p className="font-semibold mb-2">Eroare la încărcarea graficului</p>
          {isRateLimit ? (
            <div className="space-y-2">
              <p className="text-sm">
                Prea multe cereri. Te rugăm să aștepți câteva momente și să reîmprospătezi pagina.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reîncarcă pagina
              </button>
            </div>
          ) : (
            <p className="text-sm">{error.message}</p>
          )}
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

  const filteredInfo = (graphData as any).filteredInfo;

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
              {Object.entries(DOCUMENT_COLORS).filter(([key]) => key !== 'default').map(([key, color]) => (
                <div key={key} className="flex items-center space-x-3 group">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {key === 'central' ? 'Document central' : key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Levels */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              Niveluri de încredere
            </h4>
            <div className="space-y-2">
              {Object.entries(CONFIDENCE_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center space-x-3 group">
                  <svg width="32" height="4" className="flex-shrink-0">
                    <line
                      x1="0"
                      y1="2"
                      x2="32"
                      y2="2"
                      stroke={color}
                      strokeWidth={level === 'high' ? 3 : level === 'medium' ? 2 : 1}
                      strokeDasharray={level === 'low' ? '5,5' : '0'}
                    />
                  </svg>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors capitalize">
                    {level === 'high' ? 'Foarte probabil' : level === 'medium' ? 'Probabil' : 'Puțin probabil'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">
              Layout
            </h4>
            <div className="space-y-2">
              {(['concentric', 'breadthfirst', 'cose'] as const).map((layout) => (
                <button
                  key={layout}
                  onClick={() => setLayoutName(layout)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    layoutName === layout
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {layout === 'concentric' ? 'Concentric (recomandat)' : 
                   layout === 'breadthfirst' ? 'Ierarhic' : 
                   'Force-directed'}
                </button>
              ))}
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

      {/* Filtering Info Banner */}
      {filteredInfo && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                Graful este optimizat pentru claritate: afișăm {filteredInfo.displayedNodes} din {filteredInfo.originalNodes} noduri 
                și {filteredInfo.displayedLinks} din {filteredInfo.originalLinks} conexiuni (prioritizate după importanță și încredere).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cytoscape Graph */}
      <div ref={graphContainerRef} className="absolute inset-0" />

      {/* Tooltip */}
      {hoveredNode && cyRef.current && (
        (() => {
          const node = cyRef.current.$(`#${hoveredNode}`);
          if (node.length === 0) return null;
          const nodeData = node.data();
          const nodeId = String(nodeData.id);
          return (
            <div
              className="fixed z-50 bg-white p-3 rounded-lg shadow-2xl border border-gray-200 text-sm pointer-events-none max-w-sm transform -translate-y-full"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 10}px`,
              }}
            >
              <div className="font-semibold text-gray-900 mb-1 break-words">
                {nodeData.fullLabel || nodeData.label}
              </div>
              <div className="text-gray-600 text-xs space-y-1">
                {nodeData.actNumber && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Număr:</span>
                    <span>{nodeData.actNumber}</span>
                  </div>
                )}
                {nodeData.actType && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Tip:</span>
                    <span>{nodeData.actType}</span>
                  </div>
                )}
                {nodeData.publicationDate && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Publicat:</span>
                    <span>
                      {new Date(nodeData.publicationDate).toLocaleDateString('ro-RO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
              {nodeId !== documentId && (
                <div className="text-blue-600 text-xs mt-2 font-medium border-t border-gray-100 pt-2">
                  Click pentru a vizualiza documentul
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
