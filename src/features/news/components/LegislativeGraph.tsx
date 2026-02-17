'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  NodeProps,
  ReactFlowInstance,
  ControlButton,
  ProOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { fetchLegislativeGraph } from '../services/newsService';
import { LegislativeGraphNode, LegislativeGraphLink } from '../types';
import { 
  X, 
  Search, 
  AlertTriangle, 
  Scale, 
  FileText, 
  Scroll, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink,
  Filter,
  Minimize2,
  Maximize,
  Minimize,
  Network,
  Layers,
  Share2
} from 'lucide-react';

import { createNewsSlug } from '@/lib/utils/slugify';
import { useAuth } from '@/components/auth/AuthProvider';
import { Slider } from '@/components/ui/Slider';

// --- Types & Constants ---

const NODE_WIDTH = 280;
const NODE_HEIGHT = 90;

const proOptions: ProOptions = { hideAttribution: true };

const getIconForType = (type?: string) => {
  switch (type) {
    case 'OUG': return <AlertTriangle size={16} className="text-red-600" />;
    case 'Decizie': return <Scale size={16} className="text-blue-600" />;
    case 'Ordin': return <FileText size={16} className="text-green-600" />;
    case 'Lege': return <Scroll size={16} className="text-indigo-600" />;
    default: return <FileText size={16} className="text-gray-500" />;
  }
};

// --- Custom Node Component ---
const CustomNode = ({ data }: NodeProps) => {
  const getBorderColor = () => {
    if (data.isCurrentNews) return 'border-brand ring-4 ring-brand-highlight/30 ring-offset-2'; // Strong highlight for current news
    if (data.highlighted) return 'border-brand-accent ring-2 ring-brand-accent ring-offset-2';
    if (data.isFiltered || data.isDimmed) return 'border-gray-200 opacity-40 grayscale';
    
    if (data.actType === 'OUG') return 'border-red-500';
    if (data.actType === 'Decizie') return 'border-blue-500';
    if (data.actType === 'Ordin') return 'border-green-500';
    if (data.actType === 'Lege') return 'border-indigo-500';
    return 'border-gray-300';
  };

  const getBgColor = () => {
     if (data.isFiltered || data.isDimmed) return 'bg-gray-50';
     if (data.isCurrentNews) return 'bg-brand-highlight/10'; // Subtle background for current news
     if (data.actType === 'OUG') return 'bg-red-50';
     if (data.actType === 'Decizie') return 'bg-blue-50';
     if (data.actType === 'Ordin') return 'bg-green-50';
     if (data.actType === 'Lege') return 'bg-indigo-50';
     return 'bg-white';
  };

  return (
    <div className="group relative">
      {/* Current News Badge */}
      {data.isCurrentNews && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 whitespace-nowrap">
          Știrea Curentă
        </div>
      )}

      {/* Tooltip: Pure CSS hover, strict positioning, no global state dependency */}
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300 pointer-events-none z-50 text-center">
        {data.title}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>

      <div
        className={`
          px-3 py-2 shadow-sm rounded-lg border-l-4 
          ${getBorderColor()} ${getBgColor()} 
          w-[250px] transition-all duration-300
          hover:shadow-md cursor-pointer
        `}
      >
        <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400" />
        
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex-shrink-0">
            {getIconForType(data.actType)}
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {data.actType || 'Act'}
                </span>
                {data.publicationDate && (
                  <span className="text-[9px] text-gray-400">{data.publicationDate}</span>
                )}
             </div>
             
             <div className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">
               {data.actNumber ? `${data.actType || 'Act'} nr. ${data.actNumber}` : (data.shortTitle || data.title)}
             </div>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" />
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// --- Layout Helper ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80,
    ranksep: 150
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

// --- Main Component ---
interface LegislativeGraphProps {
  documentId: string;
  height?: string;
}

export function LegislativeGraph({ documentId, height = '600px' }: LegislativeGraphProps) {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const { loading: authLoading, isAuthenticated } = useAuth();

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  // Data & UI State
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<LegislativeGraphNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{nodes: LegislativeGraphNode[], links: LegislativeGraphLink[]} | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(true); // Default collapsed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.5); // Default: Relatii medii
  const [maxNodes, setMaxNodes] = useState(20);
  const [maxLinks, setMaxLinks] = useState(30);
  
  const [localMaxNodes, setLocalMaxNodes] = useState(20);
  const [localMaxLinks, setLocalMaxLinks] = useState(30);
  
  // No more automatic useEffect for debounce
  // The update happens only on mouseUp/touchEnd
  
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<Record<string, boolean>>({
    'OUG': true,
    'Decizie': true,
    'Ordin': true,
    'Lege': true,
    'Other': true
  });

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLegislativeGraph({ 
        documentId, 
        depth: 2, 
        minConfidence,
        maxNodes,
        maxLinks 
      });
      if (data) {
        setGraphData(data);
        
        const initialNodes: Node[] = data.nodes.map((node) => ({
          id: node.id,
          type: 'custom',
          data: { 
            ...node, 
            label: node.shortTitle || node.title,
            isCurrentNews: node.id === documentId // Mark if current news
          },
          position: { x: 0, y: 0 },
        }));

        const initialEdges: Edge[] = data.links.map((link, index) => ({
          id: `e${index}`,
          source: link.source,
          target: link.target,
          // No label by default to prevent white boxes
          label: link.typeLabel, 
          type: 'default', 
          animated: link.type === 'modifică',
          style: { 
            stroke: link.type === 'modifică' ? '#ef4444' : '#9ca3af', 
            strokeWidth: 1.5,
            opacity: 0.4 
          },
          // Label hidden initially via style
          labelStyle: { fill: '#6b7280', fontWeight: 500, fontSize: 10, opacity: 0 },
          labelBgStyle: { fillOpacity: 0 }, // Transparent bg for label to avoid white box
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: link.type === 'modifică' ? '#ef4444' : '#9ca3af',
            width: 20,
            height: 20,
          },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          initialNodes,
          initialEdges,
          'LR'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    } catch (err: any) {
      if (err.message === 'UNAUTHENTICATED') {
        setError('UNAUTHENTICATED');
      } else {
        console.error('Error loading graph:', err);
      }
    }
    setLoading(false);
  }, [documentId, setNodes, setEdges, minConfidence, maxNodes, maxLinks]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadGraph();
      } else {
        setError('UNAUTHENTICATED');
        setLoading(false);
      }
    }
  }, [loadGraph, authLoading, isAuthenticated]);

  // --- Logic Update: Filtering, Search & Hover ---
  useEffect(() => {
    if (!graphData) return;

    const isConnected = (nodeId: string) => {
      if (!hoveredNodeId) return false;
      if (nodeId === hoveredNodeId) return true;
      return edges.some(
        e => (e.source === hoveredNodeId && e.target === nodeId) || 
             (e.target === hoveredNodeId && e.source === nodeId)
      );
    };

    setNodes((nds) => nds.map((node) => {
      const nodeData = node.data as LegislativeGraphNode;
      const typeKey = ['OUG', 'Decizie', 'Ordin', 'Lege'].includes(nodeData.actType || '') 
        ? nodeData.actType! 
        : 'Other';
      
      const isTypeVisible = visibleTypes[typeKey];
      const matchesSearch = searchTerm === '' || 
        (nodeData.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         nodeData.actNumber?.includes(searchTerm));

      const isHidden = !isTypeVisible;
      const isHighlighted = hoveredNodeId ? isConnected(node.id) : (searchTerm !== '' && matchesSearch);
      const isDimmed = hoveredNodeId 
        ? !isConnected(node.id) 
        : (searchTerm !== '' && !matchesSearch); 

      return {
        ...node,
        hidden: isHidden,
        data: {
          ...node.data,
          isFiltered: false, 
          isDimmed: isDimmed,
          highlighted: isHighlighted
        }
      };
    }));

    setEdges((eds) => eds.map((edge) => {
       const isEdgeConnectedToHover = hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId);
       const opacity = hoveredNodeId 
         ? (isEdgeConnectedToHover ? 1 : 0.1) 
         : 0.4; 

       return {
         ...edge,
         style: {
           ...edge.style,
           opacity,
           strokeWidth: isEdgeConnectedToHover ? 2.5 : 1.5,
           stroke: edge.data?.originalColor || edge.style?.stroke 
         },
         labelStyle: {
           ...edge.labelStyle,
           opacity: isEdgeConnectedToHover ? 1 : 0 
         },
         // Show label background only when highlighted, otherwise transparent
         labelBgStyle: { 
            fill: '#ffffff', 
            fillOpacity: isEdgeConnectedToHover ? 0.9 : 0 
         },
         zIndex: isEdgeConnectedToHover ? 10 : 0
       };
    }));

    if (searchTerm && rfInstance && !hoveredNodeId) {
       const matchedNodes = nodes.filter(n => 
         (n.data.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          n.data.actNumber?.includes(searchTerm))
       );
       if (matchedNodes.length === 1) {
         rfInstance.fitView({ nodes: matchedNodes, duration: 800, padding: 0.5 });
       }
    }

  }, [searchTerm, visibleTypes, graphData, rfInstance, nodes.length, hoveredNodeId]); 

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as LegislativeGraphNode);
    if (rfInstance) {
      rfInstance.fitView({ nodes: [node], duration: 800, padding: 1.2 });
    }
  }, [rfInstance]);

  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNodeId(null);
  }, []);

  const closeDrawer = () => {
    setSelectedNode(null);
    // Auto fit view when closing drawer
    if (rfInstance) {
      // Wait for drawer animation to start/finish for smoother feel, or do it immediately.
      // Immediate feels snappy.
      setTimeout(() => {
        rfInstance.fitView({ duration: 800, padding: 0.5 });
      }, 300); // Sync with drawer transition
    }
  };

  const toggleFilter = (type: string) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleRelationClick = (targetNodeId: string) => {
    const node = nodes.find(n => n.id === targetNodeId);
    if (node) {
      setSelectedNode(node.data as LegislativeGraphNode);
      if (rfInstance) {
        rfInstance.fitView({ nodes: [node], duration: 800, padding: 1.2 });
      }
    }
  };

  const toggleFullScreen = () => {
    if (!graphContainerRef.current) return;

    if (!document.fullscreenElement) {
      graphContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const { modifies, modifiedBy } = (() => {
    if (!selectedNode || !graphData) return { modifies: [], modifiedBy: [] };
    
    const modifies = graphData.links
      .filter(l => l.source === selectedNode.id)
      .map(l => ({ link: l, node: graphData.nodes.find(n => n.id === l.target) }))
      .filter(item => item.node); 

    const modifiedBy = graphData.links
      .filter(l => l.target === selectedNode.id)
      .map(l => ({ link: l, node: graphData.nodes.find(n => n.id === l.source) }))
      .filter(item => item.node);

    return { modifies, modifiedBy };
  })();


  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-info"></div>
          <span className="text-sm text-gray-500">Se încarcă rețeaua legislativă...</span>
        </div>
      </div>
    );
  }

  if (error === 'UNAUTHENTICATED') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6" style={{ height }}>
        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-brand-info/10 to-brand-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acces Restricționat
          </h3>
          <p className="text-gray-600 mb-6">
            Harta Conexiunilor Legislative este disponibilă exclusiv pentru abonați. Vizualizează relațiile complexe dintre actele normative într-un format interactiv.
          </p>
          <div className="flex gap-3">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-highlight border border-transparent rounded-md transition-colors"
            >
              Autentificare
            </a>
            <a 
              href="/preturi" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand bg-white border border-brand rounded-md hover:bg-gray-50 transition-colors"
            >
              Vezi Abonamentele
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div 
      ref={graphContainerRef}
      className={`relative w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group ${isFullscreen ? 'bg-white' : ''}`} 
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      
      {/* Collapsible Controls Panel */}
      <div className={`absolute top-4 left-4 z-10 flex flex-col gap-2 transition-all duration-300 ${controlsCollapsed ? 'w-10' : 'w-64'}`}>
        
        <button 
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="bg-white p-2 rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-brand-info self-start mb-1"
          title={controlsCollapsed ? "Arată filtrele" : "Ascunde filtrele"}
        >
          {controlsCollapsed ? <Filter size={18} /> : <Minimize2 size={18} />}
        </button>

        {!controlsCollapsed && (
          <>
            {/* Search */}
            <div className="relative shadow-sm animate-fadeIn">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Caută nr. act sau titlu..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white/90 backdrop-blur text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-info/50 focus:border-brand-info transition duration-150 ease-in-out"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Legend */}
            <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-md p-3 shadow-sm text-xs animate-fadeIn">
              
              {/* Complexity Controls */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-500 font-semibold border-b border-gray-100 pb-1">
                  <Layers size={12} /> Complexitate Graf
                </div>
                
                <div className="space-y-3 px-1">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Max Noduri</span>
                      <span className="font-medium text-gray-700">{localMaxNodes}</span>
                    </div>
                    <Slider
                      min={5}
                      max={50}
                      step={5}
                      value={localMaxNodes}
                      onChange={setLocalMaxNodes}
                      onValueCommit={setMaxNodes}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Max Legături</span>
                      <span className="font-medium text-gray-700">{localMaxLinks}</span>
                    </div>
                    <Slider
                      min={5}
                      max={50}
                      step={5}
                      value={localMaxLinks}
                      onChange={setLocalMaxLinks}
                      onValueCommit={setMaxLinks}
                    />
                  </div>
                </div>
              </div>

              {/* Confidence Selector */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-500 font-semibold border-b border-gray-100 pb-1">
                  <Network size={12} /> Acuratețe Relații
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { value: 0.6, label: 'Relații Directe' },
                    { value: 0.5, label: 'Relații Medii' },
                    { value: 0.4, label: 'Relații Îndepărtate' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                      <input
                        type="radio"
                        name="confidence"
                        checked={minConfidence === opt.value}
                        onChange={() => setMinConfidence(opt.value)}
                        className="text-brand-info focus:ring-brand-info h-3 w-3 border-gray-300"
                      />
                      <span className={`text-gray-700 ${minConfidence === opt.value ? 'font-medium' : ''}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 text-gray-500 font-semibold border-b border-gray-100 pb-1">
                <Filter size={12} /> Filtrează Tip
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'OUG', label: 'OUG', color: 'text-red-600', bg: 'bg-red-500' },
                  { id: 'Decizie', label: 'Decizie', color: 'text-blue-600', bg: 'bg-blue-500' },
                  { id: 'Ordin', label: 'Ordin', color: 'text-green-600', bg: 'bg-green-500' },
                  { id: 'Lege', label: 'Lege', color: 'text-indigo-600', bg: 'bg-indigo-500' },
                ].map((type) => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={visibleTypes[type.id]} 
                      onChange={() => toggleFilter(type.id)}
                      className="rounded border-gray-300 text-brand-info focus:ring-brand-info h-3.5 w-3.5"
                    />
                    <span className={`w-2 h-2 rounded-full ${type.bg}`}></span>
                    <span className="text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'default' }}
        proOptions={proOptions}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        
        {/* Custom Floating Controls */}
        <Controls 
          position="bottom-left" 
          showInteractive={false} 
          className="!m-4 !shadow-md !border !border-gray-100 !rounded-lg !bg-white overflow-hidden flex flex-col"
        >
          <ControlButton onClick={toggleFullScreen} title="Fullscreen">
             {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </ControlButton>
        </Controls>
      </ReactFlow>

      {/* Side Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-80 md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-20 border-l border-gray-200 flex flex-col ${
          selectedNode ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedNode && (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                 <span className="inline-flex items-center rounded-full bg-brand-highlight/10 px-2 py-1 text-xs font-medium text-brand-highlight ring-1 ring-inset ring-brand-highlight/20 mb-2">
                   {selectedNode.actType || 'Document'}
                 </span>
                 <h2 className="text-base font-bold text-gray-900 leading-snug">
                   {selectedNode.shortTitle || 'Detalii Act'}
                 </h2>
              </div>
              <button onClick={closeDrawer} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                     <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Număr</span>
                     <div className="text-sm font-medium text-gray-900 mt-0.5">
                        {selectedNode.actNumber || '-'}
                     </div>
                  </div>
                  <div>
                     <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Dată</span>
                     <div className="text-sm font-medium text-gray-900 mt-0.5">
                        {selectedNode.publicationDate || '-'}
                     </div>
                  </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titlu Complet</h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border border-gray-100 shadow-sm">
                  {selectedNode.title}
                </p>
              </div>

              {/* Relations */}
              {(modifies.length > 0 || modifiedBy.length > 0) && (
                <div className="space-y-4 pt-2">
                  
                  {/* Modifies */}
                  {modifies.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ChevronRight size={14} /> Modifică ({modifies.length})
                      </h3>
                      <div className="space-y-2">
                        {modifies.map((rel, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleRelationClick(rel.node!.id)}
                            className="w-full text-left p-2 rounded bg-red-50 hover:bg-red-100 border border-red-100 transition-colors group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-red-700">
                                {rel.node?.shortTitle || rel.node?.title}
                              </span>
                              <ExternalLink size={12} className="text-red-300 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                            </div>
                            <span className="text-[10px] text-red-500 mt-1 block">
                               {rel.link.typeLabel || rel.link.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modified By */}
                  {modifiedBy.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ChevronLeft size={14} /> Modificat de ({modifiedBy.length})
                      </h3>
                      <div className="space-y-2">
                        {modifiedBy.map((rel, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleRelationClick(rel.node!.id)}
                            className="w-full text-left p-2 rounded bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-blue-700">
                                {rel.node?.shortTitle || rel.node?.title}
                              </span>
                              <ExternalLink size={12} className="text-blue-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                            </div>
                            <span className="text-[10px] text-blue-500 mt-1 block">
                               {rel.link.typeLabel || rel.link.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <a 
                href={`/stiri/${createNewsSlug(selectedNode.title, selectedNode.id)}`} 
                className="flex items-center justify-center gap-2 w-full bg-brand text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow text-sm hover:bg-brand-highlight"
              >
                Vezi știrea
                <ExternalLink size={16} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
