"use client";
import jsPDF from "jspdf";

interface ExportPDFProps {
  repoName: string;
  graphStats?: any;
  impactData?: any;
  fileSummary?: any;
}

export default function ExportPDF({
  repoName,
  graphStats,
  impactData,
  fileSummary,
}: ExportPDFProps) {
  const handleExport = () => {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text(`Codebase Intel Report`, 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Repository: ${repoName}`, 20, y);
    y += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
    y += 14;

    // Graph Stats
    if (graphStats?.most_imported?.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Most Imported Modules", 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      graphStats.most_imported.slice(0, 10).forEach((item: any) => {
        doc.text(`  ${item.module} — imported by ${item.imported_by} files`, 20, y);
        y += 6;
      });
      y += 6;
    }

    // File Summary
    if (fileSummary) {
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text(`File: ${fileSummary.file}`, 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Functions (${fileSummary.functions.length}): ${fileSummary.functions.slice(0, 5).join(", ")}`, 20, y);
      y += 6;
      doc.text(`Classes (${fileSummary.classes.length}): ${fileSummary.classes.join(", ")}`, 20, y);
      y += 6;
      doc.text(`Imports (${fileSummary.imports.length}): ${fileSummary.imports.slice(0, 5).join(", ")}`, 20, y);
      y += 10;
    }

    // Impact Analysis
    if (impactData) {
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Impact Analysis", 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`File: ${impactData.file}`, 20, y);
      y += 6;
      doc.text(`Total Impact Score: ${impactData.total_impact}`, 20, y);
      y += 6;
      doc.text(`Direct Dependents: ${impactData.direct_dependents.length}`, 20, y);
      y += 6;
      doc.text(`Indirect Dependents: ${impactData.indirect_dependents.length}`, 20, y);
      y += 6;
      if (impactData.direct_dependents.length > 0) {
        doc.text("Direct:", 20, y);
        y += 6;
        impactData.direct_dependents.slice(0, 5).forEach((d: string) => {
          doc.text(`  ${d}`, 20, y);
          y += 5;
        });
      }
    }

    doc.save(`${repoName}-report.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
    >
      Export PDF
    </button>
  );
}