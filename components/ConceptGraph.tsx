'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ConceptMapData } from '@/types';

export function ConceptGraph({ data }: { data: ConceptMapData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data || !data.nodes || !data.edges) return;
    
    containerRef.current.innerHTML = '';
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(d3.zoom<SVGSVGElement, unknown>().on('zoom', (e) => {
        g.attr('transform', e.transform);
      }))
      .append('g');

    const g = svg.append('g');

    // Deep copy data for D3 mutation
    const nodes = data.nodes.map(d => Object.create(d));
    const edges = data.edges.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.append('g')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 2)
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'animate-edge-draw');

    const node = g.append('g')
      .attr('stroke', '#0a0906')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        if (d.type === 'concept') return 'var(--accent-amber)';
        if (d.type === 'method') return 'var(--accent-sage)';
        if (d.type === 'result') return 'var(--accent-rust)';
        return 'var(--text-primary)';
      })
      .attr('class', 'animate-node-pulse')
      .style('animation-delay', (_, i) => `${i * 0.1}s`)
      .call(drag(simulation) as any);

    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', '12px')
      .attr('fill', 'var(--text-primary)')
      .attr('dx', 15)
      .attr('dy', 4)
      .attr('font-family', 'var(--font-mono)');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    return () => {
      simulation.stop();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full h-full min-h-[500px]" />;
}
