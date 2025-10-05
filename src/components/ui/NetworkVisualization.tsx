import { useEffect, useRef, useState } from "react";
import spaceBackground from "@/assets/space-background.jpg";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  label: string;
  topic: string;
  files?: string[];
  radius: number;
  isTopic: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
  pulse?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface NetworkVisualizationProps {
  onNodeClick: (node: Node) => void;
}

const TOPICS = [
  { name: "EXOPLANET DISCOVERY", files: ["Kepler-186f Analysis", "HD 209458b Study", "TRAPPIST-1 System"], color: "#60A5FA" },
  { name: "DARK MATTER", files: ["Galaxy Cluster Study", "Cosmic Microwave Background", "WIMPs Detection"], color: "#A78BFA" },
  { name: "MARS ROVER LOGS", files: ["Sol 3000-3100", "Terrain Analysis", "Sample Collection Data"], color: "#F87171" },
  { name: "GRAVITATIONAL WAVES", files: ["LIGO Detection Report", "Binary Merger Analysis", "Waveform Patterns"], color: "#34D399" },
];

export const NetworkVisualization = ({ onNodeClick }: NetworkVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  const orbitAngle = useRef(0);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Initialize particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    setParticles(newParticles);

    // Initialize nodes
    const initialNodes: Node[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const orbitRadius = Math.min(canvas.width, canvas.height) * 0.28;

    TOPICS.forEach((topic, i) => {
      const angle = (i / TOPICS.length) * Math.PI * 2;
      const baseX = centerX + Math.cos(angle) * orbitRadius;
      const baseY = centerY + Math.sin(angle) * orbitRadius;
      
      initialNodes.push({
        id: `topic-${i}`,
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        vx: 0,
        vy: 0,
        label: topic.name,
        topic: topic.name,
        files: topic.files,
        radius: 12,
        isTopic: true,
        pulse: Math.random() * Math.PI * 2,
      });

      topic.files.forEach((file, j) => {
        const fileAngle = angle + (j / topic.files.length) * Math.PI * 0.6 - Math.PI * 0.3;
        const fileRadius = 90;
        const fileBaseX = baseX + Math.cos(fileAngle) * fileRadius;
        const fileBaseY = baseY + Math.sin(fileAngle) * fileRadius;
        
        initialNodes.push({
          id: `file-${i}-${j}`,
          x: fileBaseX,
          y: fileBaseY,
          baseX: fileBaseX,
          baseY: fileBaseY,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15,
          label: file,
          topic: topic.name,
          radius: 6,
          isTopic: false,
          orbitAngle: (j / topic.files.length) * Math.PI * 2,
          orbitRadius: 130,
          pulse: Math.random() * Math.PI * 2,
        });
      });
    });

    setNodes(initialNodes);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      time.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update orbit angle
      if (selectedTopic) {
        orbitAngle.current += 0.015;
      }

      // Draw and update particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const twinkle = Math.sin(time.current * 2 + particle.x) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ripples
      setRipples((prevRipples) => {
        const updatedRipples = prevRipples
          .map((ripple) => ({
            ...ripple,
            radius: ripple.radius + 3,
            opacity: ripple.opacity - 0.02,
          }))
          .filter((ripple) => ripple.opacity > 0);

        updatedRipples.forEach((ripple) => {
          ctx.strokeStyle = `rgba(255, 215, 0, ${ripple.opacity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();
        });

        return updatedRipples;
      });

      // Draw connections with animated glow
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i >= j) return;

          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let shouldConnect = false;
          let opacity = 0;
          let color = "255, 255, 255";

          if (selectedTopic) {
            if (node.topic === selectedTopic && otherNode.topic === selectedTopic) {
              shouldConnect = true;
              opacity = 0.6;
              const topicData = TOPICS.find(t => t.name === selectedTopic);
              if (topicData) {
                const rgb = hexToRgb(topicData.color);
                color = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
              }
            }
          } else {
            if (distance < 200 || node.topic === otherNode.topic) {
              shouldConnect = true;
              opacity = Math.max(0, 1 - distance / 280) * 0.5;
            }
          }

          if (shouldConnect) {
            const pulse = Math.sin(time.current * 2 + i + j) * 0.2 + 0.8;
            ctx.strokeStyle = `rgba(${color}, ${opacity * pulse})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(255, 215, 0, ${opacity * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      });

      // Update and draw nodes
      nodes.forEach((node) => {
        const isHighlighted = selectedTopic === null || node.topic === selectedTopic;
        const alpha = isHighlighted ? 1 : 0.15;
        const topicData = TOPICS.find(t => t.name === node.topic);

        // Update positions
        if (selectedTopic && node.topic === selectedTopic && !node.isTopic) {
          const topicNode = nodes.find(n => n.isTopic && n.topic === selectedTopic);
          if (topicNode && node.orbitAngle !== undefined && node.orbitRadius) {
            const angle = node.orbitAngle + orbitAngle.current;
            node.x = topicNode.x + Math.cos(angle) * node.orbitRadius;
            node.y = topicNode.y + Math.sin(angle) * node.orbitRadius;
          }
        } else if (!selectedTopic && !node.isTopic) {
          const dx = mousePos.current.x - node.x;
          const dy = mousePos.current.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150 && distance > 0) {
            const force = (150 - distance) / 2000;
            node.vx -= (dx / distance) * force;
            node.vy -= (dy / distance) * force;
          }

          node.x += node.vx;
          node.y += node.vy;

          const backForce = 0.03;
          node.vx += (node.baseX - node.x) * backForce;
          node.vy += (node.baseY - node.y) * backForce;

          node.vx *= 0.9;
          node.vy *= 0.9;

          const margin = node.radius;
          if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
          if (node.x > canvas.width - margin) { node.x = canvas.width - margin; node.vx *= -0.5; }
          if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
          if (node.y > canvas.height - margin) { node.y = canvas.height - margin; node.vy *= -0.5; }
        }

        // Pulsing effect
        if (node.pulse !== undefined) {
          node.pulse += 0.05;
        }
        const pulseScale = 1 + Math.sin(node.pulse || 0) * 0.15;
        const currentRadius = node.radius * pulseScale;

        // Draw outer glow
        if (node.isTopic) {
          const glowRadius = currentRadius * 3;
          const gradient = ctx.createRadialGradient(node.x, node.y, currentRadius, node.x, node.y, glowRadius);
          
          if (topicData) {
            const rgb = hexToRgb(topicData.color);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.8})`);
            gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
          } else {
            gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.8})`);
            gradient.addColorStop(0.4, `rgba(255, 215, 0, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
          }
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        
        if (node.isTopic && topicData) {
          const rgb = hexToRgb(topicData.color);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = topicData.color;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw ring for hovered/selected
        if (node === hoveredNode || (node.isTopic && selectedTopic === node.topic)) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = topicData ? topicData.color : "rgba(255, 215, 0, 1)";
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = topicData ? topicData.color : "rgba(255, 215, 0, 1)";
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw topic labels with better styling
        if (node.isTopic && (isHighlighted || node === hoveredNode)) {
          ctx.font = "bold 13px 'Inter', system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
          ctx.fillText(node.label, node.x, node.y + currentRadius + 22);
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [nodes, hoveredNode, selectedTopic, particles]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const hovered = nodes.find((node) => {
      const dx = mousePos.current.x - node.x;
      const dy = mousePos.current.y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius + 10;
    });

    setHoveredNode(hovered || null);
  };

  const handleClick = () => {
    if (hoveredNode) {
      // Create ripple effect
      setRipples((prev) => [
        ...prev,
        {
          x: hoveredNode.x,
          y: hoveredNode.y,
          radius: hoveredNode.radius,
          maxRadius: 100,
          opacity: 1,
        },
      ]);

      if (hoveredNode.isTopic) {
        setSelectedTopic(selectedTopic === hoveredNode.topic ? null : hoveredNode.topic);
      } else {
        onNodeClick(hoveredNode);
      }
    } else if (selectedTopic) {
      setSelectedTopic(null);
    }
  };

  const selectedTopicData = TOPICS.find(t => t.name === selectedTopic);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${spaceBackground})` }}
      />
      
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 bg-gradient-cosmic opacity-70" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-space-purple/30 to-space-purple/60" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer transition-all duration-300"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ filter: selectedTopic ? "brightness(1.1)" : "brightness(1)" }}
      />

      {/* Topic focus display */}
      {selectedTopic && selectedTopicData && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div 
            className="backdrop-blur-3xl border-4 rounded-[2rem] px-20 py-12 shadow-2xl animate-scale-in"
            style={{ 
              backgroundColor: `${selectedTopicData.color}15`,
              borderColor: selectedTopicData.color,
              boxShadow: `0 0 60px ${selectedTopicData.color}40, 0 0 100px ${selectedTopicData.color}20`
            }}
          >
            <h2 
              className="text-6xl font-bold text-center tracking-wider drop-shadow-2xl mb-2"
              style={{ 
                color: "#fff",
                textShadow: `0 0 30px ${selectedTopicData.color}, 0 0 60px ${selectedTopicData.color}`
              }}
            >
              {selectedTopic}
            </h2>
            <p className="text-center text-white/80 mt-4 text-sm font-medium tracking-wide">
              Click anywhere to exit • Files orbiting in real-time
            </p>
          </div>
        </div>
      )}

      {/* Enhanced hover tooltip */}
      {hoveredNode && !selectedTopic && (
        <div
          className="absolute pointer-events-none animate-fade-in z-50"
          style={{
            left: Math.min(mousePos.current.x + 25, window.innerWidth - 220),
            top: mousePos.current.y - 50,
          }}
        >
          <div className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl px-6 py-4 rounded-2xl border-2 shadow-2xl"
               style={{ 
                 borderColor: hoveredNode.isTopic && TOPICS.find(t => t.name === hoveredNode.topic)?.color || "#FFD700",
                 boxShadow: `0 10px 40px -10px ${hoveredNode.isTopic && TOPICS.find(t => t.name === hoveredNode.topic)?.color || "#FFD700"}60`
               }}>
            <div className="font-bold text-card-foreground mb-1">{hoveredNode.label}</div>
            {hoveredNode.isTopic && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                Click to explore topic
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Label with enhanced styling */}
      <div className="absolute bottom-8 left-8 animate-float">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-2xl border-2 border-accent/40 rounded-2xl px-10 py-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50" />
            <span className="text-primary-foreground/95 font-mono text-sm tracking-[0.2em] font-bold uppercase">
              API_FILES_DISPLAY
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced instructions */}
      {!selectedTopic && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="bg-card/10 backdrop-blur-2xl border-2 border-accent/40 rounded-2xl px-10 py-5 shadow-2xl shadow-accent/10">
            <p className="text-primary-foreground text-sm text-center font-semibold tracking-wide">
              ✨ Hover over stars • Click golden topics • Watch files orbit in space
            </p>
          </div>
        </div>
      )}

      {/* Corner decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
    </div>
  );
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 215, b: 0 };
}
