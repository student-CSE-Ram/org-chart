import jsPDF from 'jspdf';
import type { Employee, BrandingConfig } from '../types/orgChart';
import { calculateFlowElements } from './layoutCalculator';
import { getLocationColorTheme } from './locationColors';

/**
 * Builds a 100% complete, pixel-perfect SVG string containing ALL employees in the company (zero collapsed nodes, zero cropping).
 */
export const generateCompleteOrgChartSVG = (
  employees: Employee[],
  branding: BrandingConfig
): { svgString: string; width: number; height: number } => {
  // Pass an EMPTY Set for collapsedNodeIds so EVERY single node in the organization is expanded
  const { nodes, edges } = calculateFlowElements(employees, new Set(), 'TB');

  if (nodes.length === 0) {
    return { svgString: '', width: 800, height: 600 };
  }

  const NODE_WIDTH = 260;
  const NODE_HEIGHT = 160;
  const PADDING = 80;

  // Calculate full absolute boundaries of all nodes in the complete tree
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    if (n.position.x < minX) minX = n.position.x;
    if (n.position.y < minY) minY = n.position.y;
    if (n.position.x + NODE_WIDTH > maxX) maxX = n.position.x + NODE_WIDTH;
    if (n.position.y + NODE_HEIGHT > maxY) maxY = n.position.y + NODE_HEIGHT;
  });

  const totalWidth = Math.ceil(maxX - minX + PADDING * 2);
  const totalHeight = Math.ceil(maxY - minY + PADDING * 2 + 80); // Extra 80px for company header

  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING + 80;

  // Map nodes by ID for fast coordinate lookup when drawing edges
  const nodeMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, { x: n.position.x + offsetX, y: n.position.y + offsetY });
  });

  // Build SVG Elements
  let svgContent = '';

  // 1. Company Brand Header inside SVG Export
  const companyTitle = (branding.companyName || 'Gallantt Ispat Limited').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  svgContent += `
    <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#f8fafc" />
    <g transform="translate(${PADDING}, 40)">
      <text x="0" y="0" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="900" fill="#0f172a">${companyTitle}</text>
      <text x="0" y="22" font-family="'Inter', system-ui, sans-serif" font-size="13" font-weight="600" fill="#64748b">Complete Organizational Hierarchy Report (${employees.length} Active Employees)</text>
    </g>
  `;

  // 2. Connecting Edge Lines
  edges.forEach((edge) => {
    const sourcePos = nodeMap.get(edge.source);
    const targetPos = nodeMap.get(edge.target);
    if (!sourcePos || !targetPos) return;

    const sx = sourcePos.x + NODE_WIDTH / 2;
    const sy = sourcePos.y + NODE_HEIGHT;
    const tx = targetPos.x + NODE_WIDTH / 2;
    const ty = targetPos.y;

    const midY = (sy + ty) / 2;

    // Smooth orthogonal step path
    const pathD = `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
    svgContent += `<path d="${pathD}" stroke="#94a3b8" stroke-width="2.5" fill="none" />`;
  });

  // 3. Employee Node Cards
  nodes.forEach((node) => {
    const emp = node.data.employee as any;
    const pos = nodeMap.get(node.id);
    if (!pos) return;

    const x = pos.x;
    const y = pos.y;
    const isCEO = !emp.managerCode;
    const locTheme = getLocationColorTheme(emp.location);

    const initials = (emp.name || '')
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const safeName = (emp.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const safeDesignation = (emp.designation || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const safeDepartment = (emp.department || 'General').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const safeCode = (emp.employeeCode || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const safeLocation = (emp.location || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

    svgContent += `
      <g transform="translate(${x}, ${y})">
        <!-- Card Container -->
        <rect x="0" y="0" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.04))" />
        
        <!-- Location Site Color Accent Top Bar -->
        <path d="M 0 16 A 16 16 0 0 1 16 0 L 244 0 A 16 16 0 0 1 260 0 L 260 6 L 0 6 Z" fill="${locTheme.hex}" />

        <!-- Header Bar -->
        <rect x="0" y="6" width="${NODE_WIDTH}" height="26" fill="#f1f5f9" />
        
        <text x="12" y="23" font-family="'Inter', system-ui, sans-serif" font-size="10" font-weight="700" fill="#475569">${safeDepartment}</text>
        
        ${
          isCEO
            ? `<g transform="translate(160, 9)">
                <rect x="0" y="0" width="88" height="20" rx="10" fill="#fef3c7" stroke="#fde68a" />
                <text x="44" y="14" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="800" fill="#78350f" text-anchor="middle">👑 CMD</text>
               </g>`
            : `<circle cx="242" cy="19" r="4" fill="#10b981" />`
        }

        <!-- User Initials Icon Avatar -->
        <rect x="14" y="44" width="40" height="40" rx="12" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
        <text x="34" y="69" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#1d4ed8" text-anchor="middle">${initials}</text>

        <!-- Name & Designation -->
        <text x="64" y="58" font-family="'Inter', system-ui, sans-serif" font-size="13" font-weight="800" fill="#0f172a">${safeName}</text>
        <text x="64" y="73" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="600" fill="#475569">${safeDesignation}</text>

        <!-- Code Pill -->
        <rect x="64" y="80" width="70" height="18" rx="4" fill="#f1f5f9" />
        <text x="99" y="93" font-family="'Inter', system-ui, sans-serif" font-size="10" font-weight="700" fill="#334155" text-anchor="middle">${safeCode}</text>

        <!-- Divider Line -->
        <line x1="14" y1="108" x2="246" y2="108" stroke="#f1f5f9" stroke-width="1" />

        <!-- Dept / Location Footer -->
        <text x="14" y="125" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">${safeDepartment}</text>
        ${
          safeLocation
            ? `<g transform="translate(14, 132)">
                <rect x="0" y="0" width="${Math.min(230, safeLocation.length * 7 + 24)}" height="20" rx="6" fill="${locTheme.bgHex}" stroke="${locTheme.borderHex}" stroke-width="1" />
                <circle cx="10" cy="10" r="3" fill="${locTheme.hex}" />
                <text x="18" y="14" font-family="'Inter', system-ui, sans-serif" font-size="9" font-weight="800" fill="${locTheme.textHex}">📍 ${safeLocation}</text>
               </g>`
            : ''
        }
      </g>
    `;
  });

  const fullSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
      ${svgContent}
    </svg>
  `;

  return { svgString: fullSvgString, width: totalWidth, height: totalHeight };
};

/**
 * Converts SVG to PNG/JPEG canvas DataURL cleanly
 */
const svgToCanvasDataUrl = (
  svgString: string,
  width: number,
  height: number,
  format: 'image/png' | 'image/jpeg'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x high resolution
      canvas.height = height * 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Failed to get 2d context');
        return;
      }

      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL(format, 0.98));
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
};

/**
 * Exports 100% complete org chart as PNG, JPEG, or SVG with zero cropping
 */
export const exportCompleteOrgChartImage = async (
  employees: Employee[],
  branding: BrandingConfig,
  format: 'png' | 'jpeg' | 'svg',
  filename = 'Gallantt_Organization_Chart'
) => {
  const { svgString, width, height } = generateCompleteOrgChartSVG(employees, branding);

  if (format === 'svg') {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    return;
  }

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = await svgToCanvasDataUrl(svgString, width, height, mimeType);

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
};

/**
 * Exports 100% complete org chart as high-res PDF document
 */
export const exportCompleteOrgChartPDF = async (
  employees: Employee[],
  branding: BrandingConfig,
  filename = 'Gallantt_Organization_Chart.pdf'
) => {
  const { svgString, width, height } = generateCompleteOrgChartSVG(employees, branding);
  const dataUrl = await svgToCanvasDataUrl(svgString, width, height, 'image/png');

  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height]
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save(filename);
};

/**
 * Prints 100% complete org chart in printable window
 */
export const printCompleteOrgChart = (employees: Employee[], branding: BrandingConfig) => {
  const { svgString } = generateCompleteOrgChartSVG(employees, branding);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${branding.companyName || 'Gallantt'} - Complete Org Chart Print</title>
        <style>
          @page { size: auto; margin: 0; }
          body { margin: 0; padding: 20px; background: #ffffff; text-align: center; }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${svgString}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Generates a standalone, self-contained single HTML bundle containing the entire interactive org chart
 */
export const downloadStandaloneHtmlBundle = (
  employees: Employee[],
  branding: BrandingConfig,
  filename = 'Gallantt_OrgChart_Interactive.html'
) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding.companyName} - Organization Hierarchy</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; transition: transform 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .card:hover { transform: translateY(-2px); border-color: #2563eb; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
  </style>
</head>
<body class="min-h-screen p-8">
  <div class="max-w-7xl mx-auto flex flex-col gap-6">
    <!-- Header -->
    <header class="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div class="flex items-center gap-4">
        <img src="/Gallantt-logo.png" alt="Gallantt Logo" class="h-12 object-contain" onError="this.style.display='none'" />
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">${branding.companyName}</h1>
          <p class="text-xs text-slate-500 font-semibold mt-0.5">Complete Organizational Hierarchy Report (${employees.length} Employees)</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
        Executive Export
      </span>
    </header>

    <!-- Employees List Hierarchy -->
    <div id="treeContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"></div>
  </div>

  <script>
    const employees = ${JSON.stringify(employees, null, 2)};
    const container = document.getElementById('treeContainer');

    employees.forEach(emp => {
      const card = document.createElement('div');
      card.className = 'card p-5 flex flex-col gap-3';
      card.innerHTML = \`
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">\${emp.employeeCode}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold \${emp.status.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">\${emp.status}</span>
        </div>
        <div>
          <h3 class="font-extrabold text-slate-900 text-base tracking-tight">\${emp.name}</h3>
          <p class="text-xs text-blue-600 font-bold mt-0.5">\${emp.designation}</p>
          <p class="text-xs text-slate-500 font-semibold mt-1">\${emp.department} \${emp.businessUnit ? '• ' + emp.businessUnit : ''}</p>
        </div>
        <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span>Manager: \${emp.managerCode || 'CMD'}</span>
          \${emp.location ? \`<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">📍 \${emp.location}</span>\` : ''}
        </div>
      \`;
      container.appendChild(card);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
