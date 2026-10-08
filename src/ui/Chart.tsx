import { useEffect, useRef } from 'react';
import { init, use, type EChartsCoreOption, type EChartsType } from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  SVGRenderer,
]);
export default function Chart({ option, label }: { option: EChartsCoreOption; label: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let chart: EChartsType | null = null;
    const render = () => {
      if (!element.clientWidth || !element.clientHeight) {
        chart?.dispatchAction({ type: 'hideTip' });
        return;
      }
      if (!chart) {
        chart = init(element, undefined, { renderer: 'svg' });
        chart.setOption({
          ...option,
          animation: false,
          textStyle: { fontFamily: 'Inter', color: '#55585A' },
        });
      } else chart.resize();
    };
    const observer = new ResizeObserver(render);
    observer.observe(element);
    render();
    return () => {
      observer.disconnect();
      chart?.dispose();
    };
  }, [option]);
  return <div ref={container} className="chart" role="img" aria-label={label} />;
}
