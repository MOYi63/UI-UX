import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { AnalysisResult, CompetitiveAnalysisResult } from '../services/geminiService';

export interface ExportOptions {
  includeHeuristics: boolean;
  includeAccessibility: boolean;
  includeVisualHierarchy: boolean;
  includeActionItems: boolean;
}

/**
 * Generates and downloads a Word document based on the AI analysis results.
 */
export async function downloadAnalysisAsWord(result: AnalysisResult, options: ExportOptions, imageBase64?: string) {
  const children: any[] = [
    new Paragraph({
      text: "UI/UX 深度审计报告",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `综合评分: ${result.overallScore}`,
          bold: true,
          size: 48,
          color: "6366f1",
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  // Add the analyzed image if provided
  if (imageBase64) {
    try {
      const base64Data = imageBase64.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      children.push(
        new Paragraph({
          text: "审计目标设计稿",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: bytes,
              transformation: {
                width: 500,
                height: 300,
              },
            } as any),
          ],
          spacing: { after: 400 },
        })
      );
    } catch (e) {
      console.error("Failed to add image to Word document", e);
    }
  }

  if (options.includeHeuristics) {
    children.push(
      new Paragraph({
        text: "1. 启发式原则评估",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({ 
                shading: { fill: "f8fafc" },
                children: [new Paragraph({ children: [new TextRun({ text: "评估维度", bold: true })] })] 
              }),
              new TableCell({ 
                shading: { fill: "f8fafc" },
                children: [new Paragraph({ children: [new TextRun({ text: "得分", bold: true })] })] 
              }),
              new TableCell({ 
                shading: { fill: "f8fafc" },
                children: [new Paragraph({ children: [new TextRun({ text: "详细反馈", bold: true })] })] 
              }),
            ],
          }),
          ...result.heuristics.map(h => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: h.name, spacing: { before: 100, after: 100 } })] }),
              new TableCell({ children: [new Paragraph({ text: h.score.toString(), spacing: { before: 100, after: 100 } })] }),
              new TableCell({ children: [new Paragraph({ text: h.feedback, spacing: { before: 100, after: 100 } })] }),
            ],
          })),
        ],
      })
    );
  }

  if (options.includeAccessibility) {
    children.push(
      new Paragraph({
        text: "2. 无障碍性 (A11y) 审计",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "发现的问题:", bold: true, color: "ef4444" })],
        spacing: { before: 100, after: 100 },
      }),
      ...result.accessibility.issues.map(issue => new Paragraph({
        text: `• ${issue.description}`,
        spacing: { before: 50 },
      })),
      new Paragraph({
        children: [new TextRun({ text: "改进建议:", bold: true, color: "10b981" })],
        spacing: { before: 200, after: 100 },
      }),
      ...result.accessibility.suggestions.map(sug => new Paragraph({
        text: `• ${sug}`,
        spacing: { before: 50 },
      }))
    );
  }

  if (options.includeVisualHierarchy) {
    children.push(
      new Paragraph({
        text: "3. 视觉层级与视线流向",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: result.visualHierarchy,
        spacing: { after: 200 },
      })
    );
  }

  if (options.includeActionItems) {
    children.push(
      new Paragraph({
        text: "4. 关键优化行动清单",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      ...result.keyActionItems.map((item, index) => new Paragraph({
        children: [
          new TextRun({ text: `${index + 1}. `, bold: true, color: "6366f1" }),
          new TextRun({ text: item.task }),
        ],
        spacing: { before: 100 },
      }))
    );
  }

  children.push(
    new Paragraph({
      text: "\n报告生成时间: " + new Date().toLocaleString(),
      alignment: AlignmentType.RIGHT,
      spacing: { before: 800 },
    }),
    new Paragraph({
      text: "由 LuminaUX AI 审计专家生成",
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `UX_Audit_Report_${new Date().getTime()}.docx`);
}

/**
 * Generates and downloads a Word document for competitive analysis based on Markdown content.
 */
export async function downloadCompetitiveAnalysisAsWord(result: CompetitiveAnalysisResult) {
  const children: any[] = [];
  const lines = result.markdown.split('\n');

  let currentTable: { headers: string[], rows: string[][] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      // Empty line, could be a spacer
      if (currentTable) {
        children.push(renderTable(currentTable));
        currentTable = null;
      }
      continue;
    }

    // Handle Headers
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.replace('# ', ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.replace('### ', ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
    } else if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        text: line.replace('#### ', ''),
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 150, after: 80 },
      }));
    } 
    // Handle Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        bullet: { level: 0 },
        spacing: { before: 100 },
      }));
    }
    // Handle Tables (Simple detection)
    else if (line.startsWith('|') && line.includes('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      
      // Check if it's a separator line (e.g., |---|---|)
      if (cells.every(c => c.match(/^-+$/))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
    }
    // Regular Paragraph
    else {
      if (currentTable) {
        children.push(renderTable(currentTable));
        currentTable = null;
      }
      children.push(new Paragraph({
        text: line,
        spacing: { before: 100, after: 100 },
      }));
    }
  }

  // Final table flush
  if (currentTable) {
    children.push(renderTable(currentTable));
  }

  // Footer
  children.push(
    new Paragraph({
      text: "\n报告生成时间: " + new Date().toLocaleString(),
      alignment: AlignmentType.RIGHT,
      spacing: { before: 800 },
    }),
    new Paragraph({
      text: "由 LuminaUX AI 竞品分析专家生成",
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Competitive_Analysis_${new Date().getTime()}.docx`);
}

/**
 * Generates and downloads a Word document for interaction documentation based on Markdown content.
 */
export async function downloadInteractionDocsAsWord(markdown: string, title: string = "交互说明文档") {
  const children: any[] = [];
  const lines = markdown.split('\n');

  let currentTable: { headers: string[], rows: string[][] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentTable) {
        children.push(renderTable(currentTable));
        currentTable = null;
      }
      continue;
    }

    // Handle Headers
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.replace('# ', ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.replace('### ', ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
    } else if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        text: line.replace('#### ', ''),
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 150, after: 80 },
      }));
    } 
    // Handle Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        bullet: { level: 0 },
        spacing: { before: 100 },
      }));
    }
    // Handle Tables
    else if (line.startsWith('|') && line.includes('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.every(c => c.match(/^-+$/))) continue;

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
    }
    // Regular Paragraph
    else {
      if (currentTable) {
        children.push(renderTable(currentTable));
        currentTable = null;
      }
      children.push(new Paragraph({
        text: line,
        spacing: { before: 100, after: 100 },
      }));
    }
  }

  if (currentTable) {
    children.push(renderTable(currentTable));
  }

  // Footer
  children.push(
    new Paragraph({
      text: "\n报告生成时间: " + new Date().toLocaleString(),
      alignment: AlignmentType.RIGHT,
      spacing: { before: 800 },
    }),
    new Paragraph({
      text: "由 LuminaUX AI 交互助手生成",
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100 },
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children: children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}_${new Date().getTime()}.docx`);
}

function renderTable(tableData: { headers: string[], rows: string[][] }) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: tableData.headers.map(h => new TableCell({
          shading: { fill: "f8fafc" },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
        })),
      }),
      ...tableData.rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ text: cell, spacing: { before: 100, after: 100 } })]
        })),
      })),
    ],
  });
}
