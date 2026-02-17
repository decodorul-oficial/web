// Type declarations for Cytoscape extensions
declare module 'cytoscape-cose-bilkent' {
  const ext: any;
  export = ext;
}

declare module 'cytoscape-cola' {
  const ext: any;
  export = ext;
}

declare module 'cytoscape-dagre' {
  const ext: any;
  export = ext;
}

declare module 'react-cytoscapejs' {
  import React from 'react';
  import type { Core, Stylesheet, LayoutOptions, ElementDefinition } from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: Stylesheet | Stylesheet[];
    layout?: LayoutOptions;
    cy?: (cy: Core) => void;
    getCytoscape?: (cy: Core) => void;
    zoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    userZoomingEnabled?: boolean;
    minZoom?: number;
    maxZoom?: number;
    boxSelectionEnabled?: boolean;
    [key: string]: any; // Allow additional props
  }

  const CytoscapeComponent: React.FC<CytoscapeComponentProps>;
  export default CytoscapeComponent;
}

