import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// Generic theme-aware line chart (Mosaic/Chart.js pattern).
// datasets: [{ label, data, color, dash?, fill? }]
function StockLineChart({ labels, datasets, ySuffix = '', height = 320 }) {
  const canvas = useRef(null);
  const chartRef = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor, tooltipTitleColor } = chartColors;
  const [ready, setReady] = useState(0);

  useEffect(() => {
    if (!labels || !datasets) return;
    const ctx = canvas.current;
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.color,
          borderWidth: d.width || 1.6,
          borderDash: d.dash || [],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: !!d.fill,
          tension: 0.15,
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 8, right: 12, bottom: 0, left: 4 } },
        scales: {
          x: {
            ticks: { maxTicksLimit: 9, color: darkMode ? textColor.dark : textColor.light },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: {
              maxTicksLimit: 6,
              color: darkMode ? textColor.dark : textColor.light,
              callback: (v) => v + ySuffix,
            },
            grid: { color: darkMode ? gridColor.dark : gridColor.light },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            display: datasets.length > 1,
            labels: { color: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light, boxWidth: 10, boxHeight: 10, usePointStyle: true },
          },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
      },
    });
    setReady((n) => n + 1);
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels, datasets, darkMode]);

  return (
    <div style={{ height }}>
      <canvas ref={canvas}></canvas>
    </div>
  );
}

export default StockLineChart;
