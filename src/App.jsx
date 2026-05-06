import { useState, useEffect, useRef, useCallback } from "react";

const ROLES = [
  { id: "exposure",   label: "Exposure",          fill: "#DBEAFE", stroke: "#2563EB", text: "#1E3A8A", dash: false },
  { id: "outcome",    label: "Outcome",            fill: "#D1FAE5", stroke: "#059669", text: "#064E3B", dash: false },
  { id: "confounder", label: "Confounder",         fill: "#FEE2E2", stroke: "#DC2626", text: "#7F1D1D", dash: false },
  { id: "mediator",   label: "Mediator",           fill: "#EDE9FE", stroke: "#7C3AED", text: "#3B0764", dash: false },
  { id: "collider",   label: "Collider",           fill: "#F3F4F6", stroke: "#6B7280", text: "#1F2937", dash: false },
  { id: "unmeasured", label: "Unmeasured",         fill: "#FEF3C7", stroke: "#D97706", text: "#78350F", dash: true  },
  { id: "proxy",      label: "Proxy of unmeasured",fill: "#FCE7F3", stroke: "#DB2777", text: "#831843", dash: false },
  { id: "modifier",   label: "Effect modifier",    fill: "#ECFCCB", stroke: "#65A30D", text: "#1A2E05", dash: false },
  { id: "selection",  label: "Selection bias",     fill: "#FFEDD5", stroke: "#EA580C", text: "#7C2D12", dash: false },
];

const roleMap = Object.fromEntries(ROLES.map(r => [r.id, r]));

const VALIDATIONS = [
  { test: (f, t, fr, tr) => fr === "outcome" && tr === "exposure",
    msg: "Outcome → Exposure arrow detected — did you mean the reverse?" },
  { test: (f, t, fr, tr) => fr === "outcome" && tr === "mediator",
    msg: "Outcome → Mediator: mediators precede the outcome, not follow it." },
  { test: (f, t, fr, tr) => fr === "exposure" && tr === "confounder",
    msg: "Exposure → Confounder: confounders cause the exposure, not the reverse." },
  { test: (f, t, fr, tr) => fr === "outcome" && tr === "confounder",
    msg: "Outcome → Confounder: confounders cause the outcome, not the reverse." },
  { test: (f, t, fr, tr) => fr === "collider" && (tr === "exposure" || tr === "outcome"),
    msg: "Collider → Exposure/Outcome: colliders are caused by exposure and outcome, not causes of them." },
  { test: (f, t, fr, tr) => fr === "proxy" && tr === "exposure",
    msg: "Proxy → Exposure: a proxy measures the unmeasured variable — it doesn't cause the exposure." },
];

function validate(fromRole, toRole) {
  for (const v of VALIDATIONS) {
    if (v.test(null, null, fromRole, toRole)) return v.msg;
  }
  return null;
}

const uid = () => Math.random().toString(36).slice(2, 8);

const defaultEdges = [
  { id: uid(), from: "", fromRole: "exposure",   to: "", toRole: "outcome" },
];

function RoleSelect({ value, onChange, side }) {
  const role = roleMap[value];
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          fontSize: 11, padding: "3px 22px 3px 8px", borderRadius: 6,
          border: `1.5px solid ${role?.stroke || "#ccc"}`,
          background: role?.fill || "#fff",
          color: role?.text || "#000",
          fontWeight: 500, cursor: "pointer", appearance: "none",
          WebkitAppearance: "none", outline: "none", width: "100%",
        }}
      >
        {ROLES.map(r => (
          <option key={r.id} value={r.id}>{r.label}</option>
        ))}
      </select>
      <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9, pointerEvents: "none", color: role?.text || "#555" }}>▾</span>
    </div>
  );
}

function EdgeRow({ edge, onChange, onDelete, index }) {
  const warning = edge.from && edge.to && edge.fromRole && edge.toRole
    ? validate(edge.fromRole, edge.toRole) : null;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 36px 1fr 28px",
        gap: 6, alignItems: "center",
        background: warning ? "#FFF7ED" : "transparent",
        borderRadius: 8, padding: warning ? "6px 8px" : "0",
        border: warning ? "1px solid #FED7AA" : "none",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            placeholder={`Variable ${index * 2 + 1}`}
            value={edge.from}
            onChange={e => onChange({ ...edge, from: e.target.value })}
            style={{
              fontSize: 12, padding: "5px 8px", borderRadius: 6,
              border: `1.5px solid ${edge.from ? (roleMap[edge.fromRole]?.stroke || "#ccc") : "#D1D5DB"}`,
              background: edge.from ? (roleMap[edge.fromRole]?.fill || "#fff") : "#fff",
              color: edge.from ? (roleMap[edge.fromRole]?.text || "#000") : "#6B7280",
              outline: "none", width: "100%", fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          <RoleSelect value={edge.fromRole} onChange={v => onChange({ ...edge, fromRole: v })} />
        </div>

        <div style={{ textAlign: "center", fontSize: 20, color: warning ? "#EA580C" : "#9CA3AF", lineHeight: 1 }}>
          {warning ? "⚡" : "→"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            placeholder={`Variable ${index * 2 + 2}`}
            value={edge.to}
            onChange={e => onChange({ ...edge, to: e.target.value })}
            style={{
              fontSize: 12, padding: "5px 8px", borderRadius: 6,
              border: `1.5px solid ${edge.to ? (roleMap[edge.toRole]?.stroke || "#ccc") : "#D1D5DB"}`,
              background: edge.to ? (roleMap[edge.toRole]?.fill || "#fff") : "#fff",
              color: edge.to ? (roleMap[edge.toRole]?.text || "#000") : "#6B7280",
              outline: "none", width: "100%", fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          <RoleSelect value={edge.toRole} onChange={v => onChange({ ...edge, toRole: v })} />
        </div>

        <button
          onClick={onDelete}
          style={{
            width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB",
            background: "transparent", color: "#9CA3AF", cursor: "pointer",
            fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            alignSelf: "center",
          }}
        >×</button>
      </div>

      {warning && (
        <div style={{
          fontSize: 11, color: "#C2410C", background: "#FFF7ED",
          border: "1px solid #FED7AA", borderRadius: "0 0 6px 6px",
          padding: "4px 10px", marginTop: -2, display: "flex", gap: 5, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 12 }}>⚠</span>
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}

function buildGraph(edges) {
  const nodeRoles = {};
  const links = [];

  edges.forEach(e => {
    if (!e.from || !e.to) return;
    if (e.from) nodeRoles[e.from] = e.fromRole;
    if (e.to)   nodeRoles[e.to]   = e.toRole;
    links.push({ from: e.from, to: e.to });
  });

  return { nodeRoles, links };
}

function layoutNodes(nodeNames, links) {
  // Simple force-directed-ish layout using iterative repulsion
  const pos = {};
  const n = nodeNames.length;
  if (n === 0) return pos;

  // Initialize in a circle
  nodeNames.forEach((name, i) => {
    const angle = (2 * Math.PI * i) / n;
    pos[name] = {
      x: 300 + 180 * Math.cos(angle),
      y: 200 + 130 * Math.sin(angle),
    };
  });

  // Iterate
  for (let iter = 0; iter < 120; iter++) {
    const forces = {};
    nodeNames.forEach(n => { forces[n] = { x: 0, y: 0 }; });

    // Repulsion
    for (let i = 0; i < nodeNames.length; i++) {
      for (let j = i + 1; j < nodeNames.length; j++) {
        const a = nodeNames[i], b = nodeNames[j];
        const dx = pos[a].x - pos[b].x;
        const dy = pos[a].y - pos[b].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
        const f = 8000 / (dist * dist);
        forces[a].x += (dx / dist) * f;
        forces[a].y += (dy / dist) * f;
        forces[b].x -= (dx / dist) * f;
        forces[b].y -= (dy / dist) * f;
      }
    }

    // Attraction for linked nodes
    links.forEach(({ from, to }) => {
      if (!pos[from] || !pos[to]) return;
      const dx = pos[to].x - pos[from].x;
      const dy = pos[to].y - pos[from].y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const idealDist = 160;
      const f = (dist - idealDist) * 0.03;
      forces[from].x += (dx / dist) * f;
      forces[from].y += (dy / dist) * f;
      forces[to].x   -= (dx / dist) * f;
      forces[to].y   -= (dy / dist) * f;
    });

    // Center gravity
    nodeNames.forEach(name => {
      forces[name].x += (300 - pos[name].x) * 0.005;
      forces[name].y += (200 - pos[name].y) * 0.005;
    });

    // Apply
    const damp = 0.85;
    nodeNames.forEach(name => {
      pos[name].x = Math.max(60, Math.min(540, pos[name].x + forces[name].x * damp));
      pos[name].y = Math.max(50, Math.min(350, pos[name].y + forces[name].y * damp));
    });
  }

  return pos;
}

function DAGCanvas({ edges, width = 600, height = 400 }) {
  const { nodeRoles, links } = buildGraph(edges);
  const nodeNames = Object.keys(nodeRoles);

  // Lift positions into state so nodes can be dragged
  const [positions, setPositions] = useState({});
  const dragRef = useRef(null); // { name, offsetX, offsetY }
  const svgRef = useRef(null);

  // Re-run layout only when node set changes (new/removed nodes)
  // Dragged positions are preserved via the positions state
  useEffect(() => {
    const computed = layoutNodes(nodeNames, links);
    setPositions(prev => {
      const next = { ...computed };
      // Preserve any manually dragged positions
      Object.keys(prev).forEach(name => {
        if (computed[name]) next[name] = prev[name];
      });
      return next;
    });
  }, [nodeNames.join(",")]);

  const pos = positions;

  const nodeRadius = name => Math.max(28, Math.min(48, name.length * 4.2 + 22));

  // Mouse drag handlers
  const onMouseDown = (e, name) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    dragRef.current = {
      name,
      offsetX: mouseX - (pos[name]?.x || 0),
      offsetY: mouseY - (pos[name]?.y || 0),
    };
  };

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const { name, offsetX, offsetY } = dragRef.current;
    setPositions(prev => ({
      ...prev,
      [name]: {
        x: Math.max(50, Math.min(550, mouseX - offsetX)),
        y: Math.max(45, Math.min(355, mouseY - offsetY)),
      }
    }));
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Compute curved bezier path between two nodes, bending away from nearby nodes
  const curvedPath = (from, to) => {
    const p1 = pos[from], p2 = pos[to];
    if (!p1 || !p2) return null;
    const r1 = nodeRadius(from), r2 = nodeRadius(to) + 5;
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return null;

    // Perpendicular unit vector for curve offset
    const px = -dy / dist, py = dx / dist;

    // Base curve offset — increases when other nodes lie close to the straight path
    let offset = 0;
    let dominantSide = 0;
    nodeNames.forEach(name => {
      if (name === from || name === to) return;
      const np = pos[name];
      if (!np) return;
      // Project node onto the edge line
      const t = ((np.x - p1.x) * dx + (np.y - p1.y) * dy) / (dist * dist);
      if (t < 0.05 || t > 0.95) return; // only care about nodes along the path
      // Distance from node to the straight line
      const closestX = p1.x + t * dx, closestY = p1.y + t * dy;
      const dToLine = Math.sqrt((np.x - closestX) ** 2 + (np.y - closestY) ** 2);
      const threshold = nodeRadius(name) + 55; // larger threshold catches near-misses
      if (dToLine < threshold) {
        const side = (np.x - p1.x) * py - (np.y - p1.y) * px > 0 ? -1 : 1;
        const push = (threshold - dToLine) * 1.1; // stronger push
        offset += side * push;
        dominantSide += side;
      }
    });

    // If multiple nodes on same side, amplify further
    if (Math.abs(dominantSide) > 1) offset *= 1.3;

    // Minimum curve — every edge gets a slight bend for visual clarity
    if (Math.abs(offset) < 18) {
      // Consistent small curve based on edge index to separate parallel edges
      const edgeIndex = links.findIndex(l => l.from === from && l.to === to);
      offset = 18 * (edgeIndex % 2 === 0 ? 1 : -1);
    }

    // Reversed edges always curve opposite
    const hasReverse = links.some(l => l.from === to && l.to === from);
    if (hasReverse) offset = Math.abs(offset) * 40;

    // Control point at midpoint + perpendicular offset
    const mx = (p1.x + p2.x) / 2 + px * offset;
    const my = (p1.y + p2.y) / 2 + py * offset;

    // Start/end points on node borders (accounting for curve direction)
    const startAngle = Math.atan2(my - p1.y, mx - p1.x);
    const endAngle   = Math.atan2(my - p2.y, mx - p2.x);
    const x1 = p1.x + Math.cos(startAngle) * r1;
    const y1 = p1.y + Math.sin(startAngle) * r1;
    const x2 = p2.x + Math.cos(endAngle)   * r2;
    const y2 = p2.y + Math.sin(endAngle)   * r2;

    return { d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` };
  };

  const modifiers = Object.entries(nodeRoles)
    .filter(([, r]) => r === "modifier")
    .map(([n]) => n);

  const hasWarning = edges.some(e =>
    e.from && e.to && validate(e.fromRole, e.toRole)
  );

  return (
    <svg
      ref={svgRef}
      width={width} height={height}
      style={{ width: "100%", height: "100%", cursor: dragRef.current ? "grabbing" : "default" }}
      viewBox="0 0 600 400"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#374151" />
        </marker>
        <marker id="arrowhead-dash" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
        </marker>
        <marker id="arrowhead-warn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#EA580C" />
        </marker>
      </defs>

      {/* Edges — curved bezier paths */}
      {links.map((link, i) => {
        const curve = curvedPath(link.from, link.to);
        if (!curve) return null;
        const fromRole = nodeRoles[link.from];
        const isDash = fromRole === "unmeasured";
        const edgeObj = edges.find(e => e.from === link.from && e.to === link.to);
        const warn = edgeObj && validate(edgeObj.fromRole, edgeObj.toRole);
        return (
          <path
            key={i}
            d={curve.d}
            fill="none"
            stroke={warn ? "#EA580C" : isDash ? "#9CA3AF" : "#374151"}
            strokeWidth={warn ? 1.5 : 1.2}
            strokeDasharray={isDash ? "6 4" : warn ? "4 3" : "none"}
            markerEnd={`url(#${warn ? "arrowhead-warn" : isDash ? "arrowhead-dash" : "arrowhead"})`}
            opacity={warn ? 0.6 : 1}
          />
        );
      })}

      {/* Nodes */}
      {nodeNames.map(name => {
        const p = pos[name];
        if (!p) return null;
        const role = roleMap[nodeRoles[name]] || roleMap.confounder;
        const r = nodeRadius(name);
        const maxChars = Math.floor(r * 0.55);
        const lines = [];
        let remaining = name;
        while (remaining.length > 0) {
          lines.push(remaining.slice(0, maxChars));
          remaining = remaining.slice(maxChars);
        }

        return (
          <g
            key={name}
            onMouseDown={e => onMouseDown(e, name)}
            style={{ cursor: "grab" }}
          >
            <circle
              cx={p.x} cy={p.y} r={r}
              fill={role.fill} stroke={role.stroke} strokeWidth={1.5}
              strokeDasharray={role.dash ? "5 3" : "none"}
            />
            {lines.map((line, li) => (
              <text
                key={li}
                x={p.x}
                y={p.y + (li - (lines.length - 1) / 2) * 11}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, Math.min(11, r * 0.28))}
                fill={role.text}
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
              >{line}</text>
            ))}
          </g>
        );
      })}

      {/* Footnote for effect modifiers */}
      {modifiers.length > 0 && (
        <text x={10} y={height - 10} fontSize={10} fill="#65A30D" fontStyle="italic" fontFamily="sans-serif">
          * Effect modifier{modifiers.length > 1 ? "s" : ""}: {modifiers.join(", ")}
        </text>
      )}

      {nodeNames.length === 0 && (
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize={13} fill="#9CA3AF" fontFamily="sans-serif">
          Add edges on the left to see your DAG
        </text>
      )}
    </svg>
  );
}

const toR = name => name.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_.]/g, "_");

function generateRCode(edges) {
  const { nodeRoles, links } = buildGraph(edges);
  const exposures = Object.entries(nodeRoles).filter(([,r]) => r === "exposure").map(([n]) => toR(n));
  const outcomes  = Object.entries(nodeRoles).filter(([,r]) => r === "outcome").map(([n]) => toR(n));
  const latents   = Object.entries(nodeRoles).filter(([,r]) => r === "unmeasured").map(([n]) => toR(n));

  const edgeStr = links.map(l => `  ${toR(l.from)} -> ${toR(l.to)}`).join("\n");
  const nodeStr = Object.keys(nodeRoles).map(n => `  ${toR(n)}`).join("\n");

  // Node sizes scaled by label length
  const nodeSizeLines = Object.keys(nodeRoles)
    .map(n => `  "${toR(n)}" = ${Math.max(14, Math.min(28, toR(n).length * 1.6 + 10)).toFixed(0)}`)
    .join(",\n");

  const latentStr = latents.length
    ? `latents(dag)   <- c(${latents.map(l => `"${l}"`).join(", ")})`
    : "";

  return `library(dagitty)
library(ggdag)
library(ggplot2)
library(dplyr)

dag <- dagitty('dag {
${nodeStr}
${edgeStr}
}')
${exposures.length ? `exposures(dag) <- c(${exposures.map(e => `"${e}"`).join(", ")})` : ""}
${outcomes.length  ? `outcomes(dag)  <- c(${outcomes.map(o => `"${o}"`).join(", ")})` : ""}
${latentStr}

# Node sizes scaled by label length
node_sizes <- c(
${nodeSizeLines}
)

# Build tidy DAG
dag_tidy <- tidy_dagitty(dag, layout = "nicely", seed = 42)
dag_tidy$data <- dag_tidy$data %>%
  mutate(node_size = node_sizes[name])

# Plot: white fill, black border, black text, size-scaled
ggplot(dag_tidy, aes(x = x, y = y, xend = xend, yend = yend)) +
  geom_dag_edges(
    arrow = grid::arrow(length = unit(5, "pt"), type = "closed", ends = "last")
  ) +
  geom_dag_node(
    aes(size = node_size),
    shape = 21, fill = "white", color = "black",
    stroke = 1.2, show.legend = FALSE
  ) +
  scale_size_identity() +
  geom_dag_text(color = "black", size = 3.0) +
  theme_dag_blank() +
  theme(plot.background = element_rect(fill = "white", color = NA))
${exposures.length && outcomes.length ? `
# Minimal adjustment sets
adjustmentSets(dag, exposure = "${exposures[0]}", outcome = "${outcomes[0]}")

# Implied conditional independencies
impliedConditionalIndependencies(dag)` : ""}`;
}

export default function App() {
  const [edges, setEdges] = useState(defaultEdges);
  const [activeTab, setActiveTab] = useState("editor");
  const [copied, setCopied] = useState(false);
  const svgRef = useRef();

  const addEdge = () => setEdges(prev => [...prev, {
    id: uid(), from: "", fromRole: "confounder", to: "", toRole: "outcome"
  }]);

  const updateEdge = (id, updated) =>
    setEdges(prev => prev.map(e => e.id === id ? updated : e));

  const deleteEdge = id =>
    setEdges(prev => prev.filter(e => e.id !== id));

  const rCode = generateRCode(edges);

  const copyCode = () => {
    navigator.clipboard.writeText(rCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadSVG = () => {
    const svg = document.getElementById("dag-svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dag.svg"; a.click();
    URL.revokeObjectURL(url);
  };

  const warnings = edges.filter(e => e.from && e.to && validate(e.fromRole, e.toRole));
  const validEdges = edges.filter(e => e.from && e.to);

  return (
    <div style={{
      minHeight: "100vh", background: "#F9FAFB",
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E5E7EB",
        padding: "12px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", letterSpacing: "-0.02em" }}>
            DAG Builder
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
            Causal diagram editor · powered by dagitty
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {warnings.length > 0 && (
            <div style={{
              fontSize: 11, color: "#C2410C", background: "#FFF7ED",
              border: "1px solid #FED7AA", borderRadius: 8,
              padding: "4px 10px", display: "flex", alignItems: "center", gap: 5
            }}>
              ⚠ {warnings.length} warning{warnings.length > 1 ? "s" : ""}
            </div>
          )}
          <button onClick={downloadSVG} style={{
            fontSize: 12, padding: "6px 14px", borderRadius: 8,
            border: "1px solid #E5E7EB", background: "#fff",
            color: "#374151", cursor: "pointer", fontWeight: 500,
          }}>↓ SVG</button>
          <button onClick={copyCode} style={{
            fontSize: 12, padding: "6px 14px", borderRadius: 8,
            border: "1px solid #E5E7EB", background: "#fff",
            color: copied ? "#059669" : "#374151", cursor: "pointer", fontWeight: 500,
          }}>{copied ? "✓ Copied!" : "Copy R code"}</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "calc(100vh - 57px)" }}>

        {/* Left panel */}
        <div style={{
          borderRight: "1px solid #E5E7EB", background: "#fff",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", padding: "0 16px" }}>
            {["editor", "code"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                fontSize: 12, fontWeight: 500, padding: "10px 12px",
                background: "transparent", border: "none", cursor: "pointer",
                color: activeTab === tab ? "#111827" : "#6B7280",
                borderBottom: activeTab === tab ? "2px solid #2563EB" : "2px solid transparent",
                marginBottom: -1,
              }}>{tab === "editor" ? "Edge editor" : "R code"}</button>
            ))}
          </div>

          {activeTab === "editor" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 36px 1fr 28px",
                gap: 6, marginBottom: 8, paddingLeft: 2,
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".06em" }}>From (cause)</div>
                <div />
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".06em" }}>To (effect)</div>
                <div />
              </div>

              {edges.map((edge, i) => (
                <EdgeRow
                  key={edge.id}
                  edge={edge}
                  index={i}
                  onChange={updated => updateEdge(edge.id, updated)}
                  onDelete={() => deleteEdge(edge.id)}
                />
              ))}

              <button onClick={addEdge} style={{
                width: "100%", padding: "8px", borderRadius: 8,
                border: "1.5px dashed #D1D5DB", background: "transparent",
                color: "#6B7280", fontSize: 12, cursor: "pointer", marginTop: 4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add edge
              </button>

              {/* Legend */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  Role legend
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {ROLES.map(r => (
                    <span key={r.id} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 999,
                      background: r.fill, border: `1px solid ${r.stroke}`,
                      color: r.text, fontWeight: 500,
                      borderStyle: r.dash ? "dashed" : "solid",
                    }}>{r.label}</span>
                  ))}
                </div>
              </div>

              {/* Adjustment sets */}
              {validEdges.length > 0 && (() => {
                const { nodeRoles } = buildGraph(edges);
                const mods = Object.entries(nodeRoles).filter(([,r]) => r === "modifier").map(([n]) => n);
                return mods.length > 0 ? (
                  <div style={{
                    marginTop: 12, padding: "8px 12px", borderRadius: 8,
                    background: "#ECFCCB", border: "1px solid #A3E635", fontSize: 11, color: "#1A2E05",
                  }}>
                    <strong>Effect modifiers:</strong> {mods.join(", ")} — assess heterogeneity of the exposure–outcome association across strata.
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              <pre style={{
                fontSize: 11, lineHeight: 1.7, color: "#1F2937",
                background: "#F9FAFB", border: "1px solid #E5E7EB",
                borderRadius: 8, padding: 14, whiteSpace: "pre-wrap",
                fontFamily: "'IBM Plex Mono', monospace", margin: 0,
              }}>{rCode}</pre>
              <button onClick={copyCode} style={{
                marginTop: 10, width: "100%", padding: "8px",
                borderRadius: 8, border: "1px solid #E5E7EB",
                background: copied ? "#D1FAE5" : "#fff",
                color: copied ? "#059669" : "#374151",
                fontSize: 12, cursor: "pointer", fontWeight: 500,
              }}>{copied ? "✓ Copied to clipboard!" : "Copy R code"}</button>
            </div>
          )}
        </div>

        {/* Right panel — DAG canvas */}
        <div style={{
          background: "#F9FAFB", display: "flex", flexDirection: "column",
          alignItems: "stretch", padding: 24, gap: 12,
        }}>
          <div style={{
            flex: 1, background: "#fff", borderRadius: 12,
            border: "1px solid #E5E7EB", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div id="dag-svg" style={{ width: "100%", height: "100%" }}>
              <DAGCanvas edges={edges} width={600} height={400} />
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>
            DAG updates live as you type · dashed circles = unmeasured/latent · dashed arrows = latent paths
          </div>
        </div>
      </div>
    </div>
  );
}
