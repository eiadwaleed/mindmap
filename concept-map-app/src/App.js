import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, X, Edit2, Trash2, RotateCw, Save, Upload, Square, Circle, Triangle, Lock, Unlock, Copy, Grid3X3 } from 'lucide-react';

const InteractiveConceptMap = () => {
  const VERTICAL_OFFSET = 100; // Add this offset to shift everything down
  const [nodes, setNodes] = useState([
    { id: 'git', label: 'Git', x: 400, y: 300 + VERTICAL_OFFSET, mainNode: true, shape: 'circle', locked: false, color: '#3b82f6' },
    { id: 'repository', label: 'Repository (Repo)', x: 200, y: 150 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#60a5fa' },
    { id: 'commit', label: 'Commit', x: 600, y: 150 + VERTICAL_OFFSET, shape: 'triangle', locked: false, color: '#60a5fa' },
    { id: 'branch', label: 'Branch', x: 400, y: 100 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#a78bfa' },
    { id: 'merge', label: 'Merge', x: 250, y: 50 + VERTICAL_OFFSET, shape: 'triangle', locked: false, color: '#f97316' },
    { id: 'pullRequest', label: 'Pull Request (PR)', x: 550, y: 50 + VERTICAL_OFFSET, shape: 'circle', locked: false, color: '#f97316' },
    { id: 'clone', label: 'Clone', x: 100, y: 300 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#34d399' },
    { id: 'fork', label: 'Fork', x: 700, y: 300 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#34d399' },
    { id: 'dag', label: 'Directed Acyclic Graph (DAG)', x: 400, y: 0 + VERTICAL_OFFSET, shape: 'circle', locked: false, color: '#facc15' },
    { id: 'gitCommands', label: 'Git Commands', x: 400, y: 500 + VERTICAL_OFFSET, shape: 'circle', locked: false, color: '#ef4444' },
    { id: 'collaboration', label: 'Collaboration Workflow', x: 150, y: 450 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#10b981' },
    { id: 'conflictResolution', label: 'Resolving Conflicts', x: 650, y: 450 + VERTICAL_OFFSET, shape: 'square', locked: false, color: '#10b981' },
    { id: 'markdown', label: 'Markdown Basics', x: 400, y: 620 + VERTICAL_OFFSET, shape: 'triangle', locked: false, color: '#8b5cf6' },
  ]);

  const [connections, setConnections] = useState([
    { id: 'git-repository', from: 'git', to: 'repository', label: 'Tracks changes' },
    { id: 'git-commit', from: 'git', to: 'commit', label: 'Snapshot of code' },
    { id: 'git-branch', from: 'git', to: 'branch', label: 'Parallel versions' },
    { id: 'branch-merge', from: 'branch', to: 'merge', label: 'Combine changes' },
    { id: 'branch-pr', from: 'branch', to: 'pullRequest', label: 'Propose changes' },
    { id: 'git-clone', from: 'git', to: 'clone', label: 'Copy remote repo' },
    { id: 'git-fork', from: 'git', to: 'fork', label: 'Personal copy' },
    { id: 'git-dag', from: 'git', to: 'dag', label: 'Graph structure' },
    { id: 'git-gitCommands', from: 'git', to: 'gitCommands', label: 'Essential commands' },
    { id: 'gitCommands-collaboration', from: 'gitCommands', to: 'collaboration', label: 'Workflow steps' },
    { id: 'gitCommands-conflictResolution', from: 'gitCommands', to: 'conflictResolution', label: 'Merge conflicts' },
    { id: 'gitCommands-markdown', from: 'gitCommands', to: 'markdown', label: 'Formatting' },
  ]);
  
  const [scale, setScale] = useState(1);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedShape, setSelectedShape] = useState('circle');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editingConnection, setEditingConnection] = useState(null);
  const [connectionLabel, setConnectionLabel] = useState('');
  
  const svgRef = useRef(null);
  const colors = ['#3b82f6', '#60a5fa', '#ef4444', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6'];

  useEffect(() => {
    if (nodes.length > 0 || connections.length > 0) {
      const currentState = {
        nodes: [...nodes],
        connections: [...connections]
      };
      setHistory(prev => [...prev.slice(0, historyIndex + 1), currentState]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [nodes, connections]);

  const snapToGrid = (value) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handlePanStart = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - viewBox.x,
        y: e.clientY - viewBox.y
      });
    }
  };

  const handlePanMove = (e) => {
    if (isPanning) {
      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;
      setViewBox(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(prev * scaleFactor, 5)));
  };

  const duplicateNode = (node) => {
    const offset = 50;
    const newNode = {
      ...node,
      id: `node-${Date.now()}`,
      x: node.x + offset,
      y: node.y + offset,
      locked: false
    };
    setNodes(prev => [...prev, newNode]);
  };

  const toggleNodeLock = (nodeId) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, locked: !node.locked } : node
    ));
  };

  const changeNodeColor = (nodeId) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId
        ? { ...node, color: colors[(colors.indexOf(node.color) + 1) % colors.length] }
        : node
    ));
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setConnections(previousState.connections);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const saveMap = () => {
    const data = { nodes, connections, viewBox };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'concept-map.json';
    a.click();
  };

  const loadMap = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        setNodes(data.nodes);
        setConnections(data.connections);
        if (data.viewBox) setViewBox(data.viewBox);
      };
      reader.readAsText(file);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));
  const handleReset = () => {
    setScale(1);
    setViewBox({ x: 0, y: 0, width: 800, height: 600 });
  };

  const handleSvgClick = (e) => {
    if (!isAddingNode || isPanning) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = snapToGrid((e.clientX - rect.left) / scale);
    const y = snapToGrid((e.clientY - rect.top) / scale);
    
    if (newNodeLabel.trim()) {
      const newNode = {
        id: `node-${Date.now()}`,
        label: newNodeLabel,
        x,
        y,
        mainNode: false,
        shape: selectedShape,
        locked: false,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      
      setNodes(prev => [...prev, newNode]);
      setNewNodeLabel('');
      setIsAddingNode(false);
    }
  };

  const handleNodeClick = (nodeId) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    } else if (selectedNodes.length < 2) {
      setSelectedNodes(prev => [...prev, nodeId]);
      
      if (selectedNodes.length === 1) {
        const newConnection = {
          id: `${selectedNodes[0]}-${nodeId}`,
          from: selectedNodes[0],
          to: nodeId,
          label: ''
        };
        
        setConnections(prev => [...prev, newConnection]);
        setSelectedNodes([]);
      }
    }
  };

  const handleDragStart = (e, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node.locked) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragNode(nodeId);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !dragNode || isPanning) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = snapToGrid((e.clientX - rect.left) / scale);
    const y = snapToGrid((e.clientY - rect.top) / scale);
    
    setNodes(prev => prev.map(node =>
      node.id === dragNode 
        ? { ...node, x, y }
        : node
    ));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  const startEditingConnection = (connectionId) => {
    const connection = connections.find(c => c.id === connectionId);
    setEditingConnection(connectionId);
    setConnectionLabel(connection.label);
  };

  const finishEditingConnection = () => {
    if (editingConnection) {
      setConnections(prev => prev.map(conn =>
        conn.id === editingConnection
          ? { ...conn, label: connectionLabel.trim() }
          : conn
      ));
    }
    setEditingConnection(null);
    setConnectionLabel('');
  };

  // In the renderShape function
  const renderShape = (shape, x, y, size) => {
    switch (shape) {
      case 'square':
        return <rect x={x - size} y={y - size} width={size * 2} height={size * 2} />;
      case 'triangle':
        const points = `${x},${y - size} ${x + size},${y + size} ${x - size},${y + size}`;
        return <polygon points={points} />;
      default:
        return <circle cx={x} cy={y} r={size} />;
    }
  };



  const deleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const deleteNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node.locked) return;
    
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const startEditingNode = (node) => {
    if (node.locked) return;
    setEditingNode(node.id);
    setEditLabel(node.label);
  };

  const finishEditingNode = () => {
    if (editingNode && editLabel.trim()) {
      setNodes(prev => prev.map(node =>
        node.id === editingNode
          ? { ...node, label: editLabel.trim() }
          : node
      ));
    }
    setEditingNode(null);
    setEditLabel('');
  };

  return (
    <div className="w-full h-full flex flex-col" width="100vw" height="100vh" style={{backgroundColor: 'pink' }} >
      <div className="flex flex-wrap gap-2 p-4 bg-gray-100">
        <div className="flex gap-2">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Undo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Redo"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2" width="100vw" height="100vh" style={{backgroundColor: 'pink' }} >
          <button onClick={handleZoomIn} className="p-2 bg-white rounded shadow hover:bg-gray-50" title="Zoom In">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={handleZoomOut} className="p-2 bg-white rounded shadow hover:bg-gray-50" title="Zoom Out">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={handleReset} className="p-2 bg-white rounded shadow hover:bg-gray-50" title="Reset View">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2" width="100vw" height="100vh" style={{backgroundColor: 'pink' }} >
          <button 
            onClick={() => setSelectedShape('circle')}
            className={`p-2 rounded shadow ${selectedShape === 'circle' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            title="Circle Shape"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSelectedShape('square')}
            className={`p-2 rounded shadow ${selectedShape === 'square' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            title="Square Shape"
          >
            <Square className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSelectedShape('triangle')}
            className={`p-2 rounded shadow ${selectedShape === 'triangle' ? 'bg-pink-500 text-white' : 'bg-pink'}`}
            title="Triangle Shape"
          >
            <Triangle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2" width="100vw" height="100vh" style={{backgroundColor: 'pink' }} >
          <button onClick={saveMap} className="p-2 bg-white rounded shadow hover:bg-gray-50" title="Save Map">
            <Save className="w-5 h-5"/>
          </button>
          <label className="p-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer" title="Load Map">
            <Upload className="w-5 h-5" />
            <input type="file" accept=".json" onChange={loadMap} className="hidden" />
          </label>
        </div>

        {/* Add node */}
        <div className="flex gap-2" width="100vw" height="100vh"  style={{backgroundColor: 'pink' }} >
          <button 
            onClick={() => setIsAddingNode(prev => !prev)}
            className={`p-2 rounded shadow ${isAddingNode ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            <Plus className="w-5 h-5" />
          </button>
          {isAddingNode && (
            <input
              type="text"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              placeholder="Enter node label"
              className="px-3 py-1 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden border rounded-lg m-4 bg-white">
        <svg 
          ref={svgRef}
          width="100vw" 
          height="100vh" 
          className="w-full h-full"
          onClick={handleSvgClick}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease',
            backgroundColor: 'pink' 
          }}
        >
          {/* Connections */}
          {connections.map(conn => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            return (
              <g key={conn.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <circle
                  cx={midX}
                  cy={midY}
                  r="8"
                  fill="yellow"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConnection(conn.id);
                  }}
                />
                <X
                  className="w-3 h-3 pointer-events-none"
                  style={{
                    transform: `translate(${midX - 6}px, ${midY - 6}px)`,
                  }}
                />
              </g>
            );
          })}
          
          {/* Nodes */}
          {nodes.map(node => (
            <g 
              key={node.id}
              onMouseDown={(e) => handleDragStart(e, node.id)}
              className="cursor-grab active:cursor-grabbing"
            >
              <g
                fill={selectedNodes.includes(node.id) ? '#2563eb' : (node.mainNode ? '#3b82f6' : '#60a5fa')}
                opacity="0.9"
                className="transition-all duration-300 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                >
                {renderShape(node.shape, node.x, node.y, node.mainNode ? 60 : 45)}
                </g>
                
                {editingNode === node.id ? (
                <foreignObject
                  x={node.x - 50}
                  y={node.y - 15}
                  width="100"
                  height="30"
                  className="pointer-events-auto"
                >
                  <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={finishEditingNode}
                  onKeyPress={(e) => e.key === 'Enter' && finishEditingNode()}
                  className="w-full px-2 py-1 text-sm border rounded"
                  autoFocus
                  />
                </foreignObject>
                ) : (
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize={node.mainNode ? "25" : "20"}
                  className="select-none pointer-events-none"
                >
                  {node.label.split('\n').map((line, i) => (
                  <tspan
                    key={i}
                    x={node.x}
                    dy={i === 0 ? 0 : '1.2em'}
                  >
                    {line}
                  </tspan>
                  ))}
                </text>
                )}
                
                {/* Node controls - moved further right */}
                <g className="opacity-0 hover:opacity-100 transition-opacity">
                <rect
                  x={node.x + 60}  // Changed from +15 to +60
                  y={node.y - 45}
                  width="40"
                  height="20"
                  rx="4"
                  fill="white"
                  stroke="#94a3b8"
                  className="cursor-pointer"
                  onClick={(e) => {
                  e.stopPropagation();
                  startEditingNode(node);
                  }}
                />
                <text
                  x={node.x + 80}  // Changed from +35 to +80
                  y={node.y - 32}
                  textAnchor="middle"
                  fill="#4b5563"
                  fontSize="12"
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                  e.stopPropagation();
                  startEditingNode(node);
                  }}
                >
                  Edit
                </text>
                <rect
                  x={node.x + 60}  // Changed from +15 to +60
                  y={node.y - 20}
                  width="40" 
                  height="20"
                  rx="4"
                  fill="white"
                  stroke="#94a3b8"
                  className="cursor-pointer"
                  onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                  }}
                />
                <text
                  x={node.x + 80}  // Changed from +35 to +80
                  y={node.y - 7}
                  textAnchor="middle"
                  fill="#4b5563"
                  fontSize="12"
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                  }}
                >
                  Delete
                </text>

                <Trash2
                  className="w-4 h-4 text-gray-600 cursor-pointer"
                  style={{
                  transform: `translate(${node.x + 76}px, ${node.y - 4}px)`,  // Changed from +31 to +76
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodes([]);
                    setConnections([]);
                  }}
                />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default InteractiveConceptMap;