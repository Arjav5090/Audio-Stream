import { useEffect, useRef, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import * as d3 from "d3";

const AudioVisualization = () => {
  const { audioDataRef } = useContext(SocketContext);
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 200;
    
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, 255]);
    
    const line = d3
      .line()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(new Array(2048).fill(128)).attr("stroke", "lightgray").attr("stroke-width", 2).attr("fill", "none");

    const updateWaveform = () => {
      if (audioDataRef?.current) {
        xScale.domain([0, audioDataRef.current.length]);
        svg.select("path").datum(audioDataRef.current).attr("d", line);
      }
      requestAnimationFrame(updateWaveform);
    };

    updateWaveform();
  }, [audioDataRef]);

  return <svg ref={svgRef} width={600} height={200}></svg>;
};

export default AudioVisualization;
