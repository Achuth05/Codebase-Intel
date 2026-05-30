"use client";
import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getGraphStats, getFileSummary, getFilesImporting } from "@/services/api";
import { getAllFunctions, getAllClasses } from "@/services/api";
import NodeDetailPanel from "./NodeDetailPanel";
import GraphControls from "./GraphControls";
import { FileSummary } from "@/types/graph";

const LANG_COLORS: Record<string, string> = {
  py: "#3b82f6",
  ts: "#10b981",
  js: "#f59e0b",
  md: "#6b7280",
  default: "#8b5cf6",
};

function getNodeColor(filePath: string): string {
  const ext = filePath.split(".").pop() || "default";
  return LANG_COLORS[ext] || LANG_COLORS.default;
}

interface RepoGraphProps {
  repoName: string;
  graphData: {
    nodes: { id: string; label: string }[];
    edges: { source: string; target: string }[];
  };
}

export default function RepoGraph({ repoName, graphData }: RepoGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedFile, setSelectedFile] = useState<FileSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Build React Flow nodes and edges from graph data
  useEffect(() => {
    if (!graphData) return;

    const filtered = graphData.nodes.filter((n) => {
      const matchesFilter =
        activeFilter === "all" || n.label.endsWith(`.${activeFilter}`);
      const matchesSearch =
        searchQuery === "" ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const filteredIds = new Set(filtered.map((n) => n.id));

    // Layout nodes in a grid
    const flowNodes: Node[] = filtered.map((n, i) => ({
      id: n.id,
      position: {
        x: (i % 8) * 200,
        y: Math.floor(i / 8) * 120,
      },
      data: { label: n.label.split("/").pop() || n.label },
      style: {
        background: getNodeColor(n.label),
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "11px",
        padding: "8px 12px",
        cursor: "pointer",
        maxWidth: "160px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }));

    const flowEdges: Edge[] = graphData.edges
      .filter((e) => filteredIds.has(e.source) && filteredIds.has(e.target))
      .map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        style: { stroke: "#4b5563", strokeWidth: 1 },
        animated: false,
      }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [graphData, activeFilter, searchQuery]);

  const onNodeClick: NodeMouseHandler = useCallback(
    async (_, node) => {
      try {
        const data = await getFileSummary(repoName, node.id);
        setSelectedFile(data);
      } catch {
        setSelectedFile({ file: node.id, functions: [], classes: [], imports: [] });
      }
    },
    [repoName]
  );

  return (
    <div className="relative w-full h-[75vh] bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <GraphControls
          onFilter={setActiveFilter}
          onSearch={setSearchQuery}
          activeFilter={activeFilter}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#374151" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => (n.style?.background as string) || "#6b7280"}
          style={{ background: "#1f2937" }}
        />
      </ReactFlow>

      <NodeDetailPanel
        data={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
}