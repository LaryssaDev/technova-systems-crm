
import React, { useState } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart, Plus, X, Calendar, Briefcase, TrendingUp, Trash2, FileText, UserPlus } from 'lucide-react';
import { FinanceType, UserRole } from '../types';
import { FINANCE_CATEGORIES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';

// ─── Monthly Obligations ───────────────────────────────────────────────────────
const MONTHLY_OBLIGATIONS = [
  { name: 'Internet',     amount: 70   },
  { name: 'Faculdade',    amount: 260  },
  { name: 'Contador',     amount: 215  },
  { name: 'Escritório',   amount: 63   },
  { name: 'Água',         amount: 100  },
  { name: 'Empréstimo 2', amount: 310  },
  { name: 'Luz',          amount: 75   },
];

const PRO_LABORE_RATE = 0.24;

interface Partner {
  name: string;
  percentage: number;
}

// ─── PDF Generation ────────────────────────────────────────────────────────────
const generatePDF = async (
  partners: Partner[],
  incomes: any[],
  expenses: any[],
  totalIncomes: number,
  totalExpenses: number,
  selectedMonth: string,
  formatMonth: (m: string) => string
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;

  // ── Brand Colors ──
  const C = {
    navy:       [15, 20, 45]   as [number,number,number],
    blue:       [37, 99, 235]  as [number,number,number],
    white:      [255,255,255]  as [number,number,number],
    offWhite:   [237,237,237]  as [number,number,number],
    lightGray:  [248,250,252]  as [number,number,number],
    gray:       [100,116,139]  as [number,number,number],
    darkGray:   [51, 65, 85]   as [number,number,number],
    green:      [16, 185, 129] as [number,number,number],
    red:        [239, 68, 68]  as [number,number,number],
    amber:      [245,158, 11]  as [number,number,number],
    blueLight:  [219,234,254]  as [number,number,number],
  };

  // ── Helpers ──
  const setFill = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const setTxt  = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);

  const currency = (v: number) =>
    'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // ─────────── PAGE STATE ────────────────────────────────────────────────────
  let page = 1;
  let y = 0;

  const addFooter = () => {
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      setFill(C.navy);
      doc.rect(0, pageH - 14, pageW, 14, 'F');
      setTxt(C.offWhite);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('TechNova Systems', margin, pageH - 5.5);
      doc.text(`Página ${p} de ${total}`, pageW - margin, pageH - 5.5, { align: 'right' });
      doc.text('Relatório de Movimentações Financeiras — Documento Confidencial', pageW / 2, pageH - 5.5, { align: 'center' });
    }
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 22) {
      doc.addPage();
      page++;
      y = margin;
    }
  };

  // ─────────── HEADER ────────────────────────────────────────────────────────
  // Deep navy background
  setFill(C.navy);
  doc.rect(0, 0, pageW, 52, 'F');

  // Blue accent stripe
  setFill(C.blue);
  doc.rect(0, 52, pageW, 3, 'F');

  // Load logo from Imgur
  try {
    const logoUrl = 'https://i.imgur.com/SH35xbf.png';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = logoUrl;
    });
    if (img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const logoH = 18;
      const logoW = logoH * (img.naturalWidth / img.naturalHeight);
      doc.addImage(dataUrl, 'PNG', margin, 9, logoW, logoH);
    }
  } catch {}

  // Company name + title
  setTxt(C.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TechNova Systems', 52, 22);
  setTxt(C.offWhite);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Movimentações Financeiras', 52, 31);
  doc.setFontSize(8);
  setTxt([180,200,240]);
  doc.text(`Período: ${formatMonth(selectedMonth)}`, 52, 39);
  doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 52, 46);

  y = 68;

  // ─────────── CALCULATIONS ─────────────────────────────────────────────────
  const resultado = totalIncomes - totalExpenses;

  // Check obligations
  const obligationResults = MONTHLY_OBLIGATIONS.map(ob => {
    const found = expenses.some(e =>
      e.description.toLowerCase().includes(ob.name.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(ob.name.toLowerCase()))
    );
    return { ...ob, paid: found };
  });

  const totalUnpaidObligations = obligationResults
    .filter(o => !o.paid)
    .reduce((acc, o) => acc + o.amount, 0);

  const resultadoAjustado = resultado - totalUnpaidObligations;
  const proLabore = Math.max(0, resultadoAjustado * PRO_LABORE_RATE);
  const afterProLabore = resultadoAjustado - proLabore;

  // ─────────── SECTION HELPER ────────────────────────────────────────────────
  const sectionTitle = (title: string, icon?: string) => {
    ensureSpace(18);
    setFill(C.navy);
    doc.roundedRect(margin, y, contentW, 11, 2, 2, 'F');
    setTxt(C.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text((icon ? icon + ' ' : '') + title, margin + 5, y + 7.5);
    y += 15;
  };

  const infoRow = (label: string, value: string, labelColor = C.darkGray, valueColor = C.navy, bgColor?: [number,number,number]) => {
    ensureSpace(10);
    if (bgColor) {
      setFill(bgColor);
      doc.rect(margin, y - 1, contentW, 9, 'F');
    }
    setTxt(labelColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 4, y + 5.5);
    setTxt(valueColor);
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + contentW - 4, y + 5.5, { align: 'right' });
    y += 9;
  };

  const divider = () => {
    setDraw([230,230,235]);
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin + contentW, y);
    y += 4;
  };

  // ─────────── RESUMO FINANCEIRO ─────────────────────────────────────────────
  sectionTitle('RESUMO FINANCEIRO');

  // 3-column summary cards
  const cardW = (contentW - 8) / 3;
  const cards = [
    { label: 'Total de Entradas', value: currency(totalIncomes), color: C.green },
    { label: 'Total de Saídas',   value: currency(totalExpenses), color: C.red   },
    { label: 'Resultado do Mês',  value: currency(resultado),     color: resultado >= 0 ? C.blue : C.red },
  ];
  cards.forEach((card, i) => {
    const cx = margin + i * (cardW + 4);
    setFill(C.lightGray);
    doc.roundedRect(cx, y, cardW, 22, 2, 2, 'F');
    setDraw(card.color);
    doc.setLineWidth(0.8);
    doc.line(cx, y, cx + cardW, y);
    setTxt(C.gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(card.label.toUpperCase(), cx + cardW / 2, y + 8, { align: 'center' });
    setTxt(card.color);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, cx + cardW / 2, y + 17, { align: 'center' });
  });
  y += 30;

  // ─────────── ENTRADAS ─────────────────────────────────────────────────────
  sectionTitle('ENTRADAS');
  if (incomes.length === 0) {
    setTxt(C.gray); doc.setFontSize(9); doc.setFont('helvetica','italic');
    doc.text('Nenhuma entrada registrada no período.', margin + 4, y + 5);
    y += 12;
  } else {
    // Table header
    setFill(C.blueLight);
    doc.rect(margin, y, contentW, 8, 'F');
    setTxt(C.blue);
    doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('Descrição', margin + 4, y + 5.5);
    doc.text('Data', margin + contentW * 0.65, y + 5.5, { align: 'center' });
    doc.text('Valor', margin + contentW - 4, y + 5.5, { align: 'right' });
    y += 9;

    incomes.forEach((entry, idx) => {
      ensureSpace(9);
      if (idx % 2 === 0) { setFill([252,254,252]); doc.rect(margin, y, contentW, 8, 'F'); }
      setTxt(C.darkGray); doc.setFontSize(8); doc.setFont('helvetica','normal');
      const desc = doc.splitTextToSize(entry.description, contentW * 0.55);
      doc.text(desc[0], margin + 4, y + 5.5);
      doc.text(new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR'), margin + contentW * 0.65, y + 5.5, { align: 'center' });
      setTxt(C.green); doc.setFont('helvetica','bold');
      doc.text(currency(entry.amount), margin + contentW - 4, y + 5.5, { align: 'right' });
      y += 8;
    });

    // Total row
    setFill(C.navy);
    doc.rect(margin, y, contentW, 9, 'F');
    setTxt(C.white); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('TOTAL DE ENTRADAS', margin + 4, y + 6.3);
    doc.text(currency(totalIncomes), margin + contentW - 4, y + 6.3, { align: 'right' });
    y += 13;
  }

  // ─────────── SAÍDAS ───────────────────────────────────────────────────────
  sectionTitle('SAÍDAS');
  if (expenses.length === 0) {
    setTxt(C.gray); doc.setFontSize(9); doc.setFont('helvetica','italic');
    doc.text('Nenhuma saída registrada no período.', margin + 4, y + 5);
    y += 12;
  } else {
    setFill([254,242,242]);
    doc.rect(margin, y, contentW, 8, 'F');
    setTxt(C.red); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('Descrição', margin + 4, y + 5.5);
    doc.text('Data', margin + contentW * 0.65, y + 5.5, { align: 'center' });
    doc.text('Valor', margin + contentW - 4, y + 5.5, { align: 'right' });
    y += 9;

    expenses.forEach((entry, idx) => {
      ensureSpace(9);
      if (idx % 2 === 0) { setFill([255,252,252]); doc.rect(margin, y, contentW, 8, 'F'); }
      setTxt(C.darkGray); doc.setFontSize(8); doc.setFont('helvetica','normal');
      const desc = doc.splitTextToSize(entry.description, contentW * 0.55);
      doc.text(desc[0], margin + 4, y + 5.5);
      doc.text(new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR'), margin + contentW * 0.65, y + 5.5, { align: 'center' });
      setTxt(C.red); doc.setFont('helvetica','bold');
      doc.text(currency(entry.amount), margin + contentW - 4, y + 5.5, { align: 'right' });
      y += 8;
    });

    setFill(C.navy);
    doc.rect(margin, y, contentW, 9, 'F');
    setTxt(C.white); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('TOTAL DE SAÍDAS', margin + 4, y + 6.3);
    doc.text(currency(totalExpenses), margin + contentW - 4, y + 6.3, { align: 'right' });
    y += 13;
  }

  // ─────────── OBRIGAÇÕES MENSAIS ────────────────────────────────────────────
  sectionTitle('OBRIGAÇÕES MENSAIS');

  // Header
  setFill(C.navy);
  doc.rect(margin, y, contentW, 8, 'F');
  setTxt(C.white); doc.setFontSize(8); doc.setFont('helvetica','bold');
  const colOb = [margin + 4, margin + contentW * 0.5, margin + contentW * 0.75, margin + contentW - 4];
  doc.text('Obrigação', colOb[0], y + 5.5);
  doc.text('Valor', colOb[1], y + 5.5);
  doc.text('Status', colOb[2], y + 5.5);
  y += 9;

  let totalUnpaidShown = 0;
  obligationResults.forEach((ob, idx) => {
    ensureSpace(9);
    const bg: [number,number,number] = ob.paid ? [240,253,244] : [255,241,242];
    setFill(bg);
    doc.rect(margin, y, contentW, 8, 'F');
    setTxt(C.darkGray); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(ob.name, colOb[0], y + 5.5);
    doc.text(currency(ob.amount), colOb[1], y + 5.5);
    if (ob.paid) {
      setTxt(C.green); doc.setFont('helvetica','bold');
      doc.text('✓ Pago', colOb[2], y + 5.5);
    } else {
      setTxt(C.red); doc.setFont('helvetica','bold');
      doc.text('✗ Não pago / descontado', colOb[2], y + 5.5);
      totalUnpaidShown += ob.amount;
    }
    y += 8;
  });

  // Subtotal unpaid
  ensureSpace(10);
  setFill([255,228,230]);
  doc.rect(margin, y, contentW, 9, 'F');
  setTxt(C.red); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('Total Descontado Automaticamente', colOb[0], y + 6.3);
  doc.text(currency(totalUnpaidShown), margin + contentW - 4, y + 6.3, { align: 'right' });
  y += 13;

  // ─────────── PRÓ-LABORE ───────────────────────────────────────────────────
  sectionTitle('CÁLCULO DO PRÓ-LABORE (24%)');

  infoRow('Resultado do Mês', currency(resultado), C.gray, C.darkGray, [248,250,252]);
  infoRow('(-) Obrigações Pendentes Descontadas', currency(totalUnpaidObligations), C.gray, C.red, C.white as any);
  
  // Highlighted base
  setFill(C.blueLight);
  doc.rect(margin, y - 1, contentW, 9, 'F');
  setTxt(C.blue); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('Base após Obrigações', margin + 4, y + 5.5);
  doc.text(currency(resultadoAjustado), margin + contentW - 4, y + 5.5, { align: 'right' });
  y += 10;

  infoRow('(-) Pró-labore 24%', currency(proLabore), C.gray, C.red, [255,252,252]);

  // Highlighted result
  setFill(C.navy);
  doc.rect(margin, y - 1, contentW, 10, 'F');
  setTxt(C.white); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('Valor Restante após Pró-labore', margin + 4, y + 6.5);
  doc.text(currency(afterProLabore), margin + contentW - 4, y + 6.5, { align: 'right' });
  y += 14;

  // ─────────── DIVISÃO DOS SÓCIOS ────────────────────────────────────────────
  sectionTitle('DIVISÃO DOS SÓCIOS');

  setFill(C.navy);
  doc.rect(margin, y, contentW, 8, 'F');
  setTxt(C.white); doc.setFontSize(8); doc.setFont('helvetica','bold');
  doc.text('Sócio', margin + 4, y + 5.5);
  doc.text('Porcentagem', margin + contentW * 0.5, y + 5.5);
  doc.text('Valor a Receber', margin + contentW - 4, y + 5.5, { align: 'right' });
  y += 9;

  partners.forEach((partner, idx) => {
    ensureSpace(10);
    const partnerValue = afterProLabore * (partner.percentage / 100);
    setFill(idx % 2 === 0 ? C.lightGray : C.white);
    doc.rect(margin, y, contentW, 9, 'F');
    setTxt(C.darkGray); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text(partner.name, margin + 4, y + 6.3);
    setTxt(C.blue);
    doc.text(`${partner.percentage}%`, margin + contentW * 0.5, y + 6.3);
    setTxt(C.green);
    doc.text(currency(partnerValue), margin + contentW - 4, y + 6.3, { align: 'right' });
    y += 9;
  });
  y += 4;

  // ─────────── LUCRO TOTAL FINAL ─────────────────────────────────────────────
  ensureSpace(60);
  y += 4;

  // Big final card
  setFill(C.navy);
  doc.roundedRect(margin, y, contentW, 52, 3, 3, 'F');
  setFill(C.blue);
  doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');
  doc.rect(margin, y + 10, contentW, 4, 'F'); // square bottom of header

  setTxt(C.white); doc.setFontSize(11); doc.setFont('helvetica','bold');
  doc.text('RESUMO FINAL DO RELATÓRIO', pageW / 2, y + 9.5, { align: 'center' });
  y += 16;

  const summaryRows = [
    { label: 'Total de Entradas',                     value: currency(totalIncomes),              color: C.green },
    { label: 'Total de Saídas Registradas',           value: currency(totalExpenses),             color: C.red   },
    { label: 'Total Obrigações Descontadas Automaticamente', value: currency(totalUnpaidObligations), color: C.amber },
    { label: 'Valor do Pró-labore (24%)',              value: currency(proLabore),                 color: C.amber },
    { label: 'Total Distribuído aos Sócios',          value: currency(afterProLabore),            color: C.blue  },
  ];

  summaryRows.forEach(row => {
    setTxt(C.offWhite); doc.setFontSize(8.5); doc.setFont('helvetica','normal');
    doc.text(row.label, margin + 6, y + 5.5);
    setTxt(row.color); doc.setFont('helvetica','bold');
    doc.text(row.value, margin + contentW - 6, y + 5.5, { align: 'right' });
    y += 7;
  });

  // Lucro total final highlight
  y += 2;
  setFill(C.green);
  doc.roundedRect(margin + 4, y, contentW - 8, 14, 2, 2, 'F');
  setTxt(C.white); doc.setFontSize(13); doc.setFont('helvetica','bold');
  doc.text('LUCRO TOTAL FINAL:', margin + 12, y + 9.5);
  doc.text(currency(afterProLabore), margin + contentW - 12, y + 9.5, { align: 'right' });
  y += 18;

  // ─────────── ASSINATURA DA CEO ─────────────────────────────────────────────
  ensureSpace(40);
  y += 15;

  try {
    const sigUrl = 'https://i.imgur.com/EXt4S8C.jpeg';
    const sigImg = new Image();
    sigImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      sigImg.onload = () => resolve();
      sigImg.onerror = () => resolve();
      sigImg.src = sigUrl;
    });
    if (sigImg.complete && sigImg.naturalWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = sigImg.naturalWidth;
      canvas.height = sigImg.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(sigImg, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const sigW = 40;
      const sigH = sigW * (sigImg.naturalHeight / sigImg.naturalWidth);
      doc.addImage(dataUrl, 'JPEG', pageW / 2 - sigW / 2, y, sigW, sigH);
      y += sigH + 2;
    } else {
      y += 20; // fallback spacing if image fails
    }
  } catch {}

  setDraw(C.gray);
  doc.setLineWidth(0.5);
  doc.line(pageW / 2 - 35, y, pageW / 2 + 35, y);
  y += 5;
  setTxt(C.navy);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Laryssa Ferreira', pageW / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTxt(C.gray);
  doc.text('CEO - TechNova Systems', pageW / 2, y, { align: 'center' });

  // ─────────── FOOTER ────────────────────────────────────────────────────────
  addFooter();

  // ─────────── SAVE ──────────────────────────────────────────────────────────
  const filename = `relatorio-financeiro-${selectedMonth}.pdf`;
  doc.save(filename);
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Finance: React.FC<{ store: any }> = ({ store }) => {
  const [showModal, setShowModal] = useState(false);
  const [showExtrato, setShowExtrato] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    type: FinanceType.INCOME,
    description: '',
    amount: 0,
    category: 'Venda',
    paymentMethod: 'Pix',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [partners, setPartners] = useState<Partner[]>([
    { name: 'Laryssa', percentage: 50 },
    { name: 'Gustavo', percentage: 50 },
  ]);
  const [partnerError, setPartnerError] = useState('');

  const availableMonths = [
    ...new Set([
      new Date().toISOString().slice(0, 7),
      ...store.financialEntries.map((e: any) => e.date.slice(0, 7))
    ])
  ].sort((a, b) => b.localeCompare(a));

  const filteredEntries = store.financialEntries.filter((e: any) => e.date.startsWith(selectedMonth));

  const incomes = filteredEntries.filter((e: any) => e.type === FinanceType.INCOME);
  const expenses = filteredEntries.filter((e: any) => e.type === FinanceType.EXPENSE);

  const totalIncomes = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const chartData = [
    { name: 'Entradas', value: totalIncomes },
    { name: 'Saídas', value: totalExpenses },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addFinancialEntry({
      ...formData,
      responsibleId: store.currentUser.id
    });
    setShowModal(false);
    setFormData({ type: FinanceType.INCOME, description: '', amount: 0, category: 'Venda', paymentMethod: 'Pix', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Partner management
  const addPartner = () => {
    setPartners(prev => [...prev, { name: '', percentage: 0 }]);
    setPartnerError('');
  };

  const removePartner = (idx: number) => {
    setPartners(prev => prev.filter((_, i) => i !== idx));
    setPartnerError('');
  };

  const updatePartner = (idx: number, field: keyof Partner, value: string | number) => {
    setPartners(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setPartnerError('');
  };

  const totalPercentage = partners.reduce((acc, p) => acc + Number(p.percentage), 0);

  const handleGeneratePDF = async () => {
    // Validate
    if (partners.length === 0) {
      setPartnerError('Adicione pelo menos um sócio.');
      return;
    }
    if (partners.some(p => !p.name.trim())) {
      setPartnerError('Preencha o nome de todos os sócios.');
      return;
    }
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setPartnerError(`A soma das porcentagens deve ser 100%. Atual: ${totalPercentage.toFixed(1)}%`);
      return;
    }
    setPartnerError('');
    setGeneratingPDF(true);
    try {
      await generatePDF(partners, incomes, expenses, totalIncomes, totalExpenses, selectedMonth, formatMonth);
    } finally {
      setGeneratingPDF(false);
      setShowReportModal(false);
    }
  };

  if (store.currentUser.role === UserRole.RH) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="text-emerald-400" /> Fluxo de Caixa</h2>
          <p className="text-slate-400 text-sm">Gestão financeira e controle de lucratividade estratégica</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:flex-none">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-48 bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none capitalize"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonth(month)}</option>
              ))}
            </select>
          </div>

          {/* PDF Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            id="btn-gerar-relatorio-pdf"
            className="flex-none bg-gradient-to-r from-[#0f142d] to-[#2563EB] hover:from-[#1a2050] hover:to-[#3b82f6] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-2 border border-blue-700/30"
          >
            <FileText size={16} />
            Gerar Relatório PDF
          </button>

          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Plus size={16} className="inline mr-2" /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform"><ArrowUpCircle size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{formatMonth(selectedMonth)}</span>
          </div>
          <p className="text-4xl font-black text-white">R$ {totalIncomes.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl group hover:border-rose-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform"><ArrowDownCircle size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Despesas Mensais</span>
          </div>
          <p className="text-4xl font-black text-white">R$ {totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`bg-slate-900 border-2 p-8 rounded-3xl ${balance >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'} relative overflow-hidden group transition-all`}>
           <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} group-hover:scale-110 transition-transform`}><PieChart size={32} /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Resultado do Mês</span>
          </div>
          <p className={`text-4xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] h-[450px]">
           <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> Fluxo {formatMonth(selectedMonth)}</h3>
           <ResponsiveContainer width="100%" height="80%">
             <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
               <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
               <Tooltip cursor={{fill: '#1e293b', radius: 12}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '15px'}} />
               <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={60}>
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold">Movimentações de {formatMonth(selectedMonth).split(' ')[0]}</h3>
              <button 
                onClick={() => setShowExtrato(true)}
                className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors bg-blue-500/10 px-3 py-1 rounded-full"
              >
                Extrato -&gt;
              </button>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {[...filteredEntries].reverse().slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-5 bg-slate-800/20 border border-slate-800/50 rounded-2xl hover:bg-slate-800/40 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${entry.type === FinanceType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {entry.type === FinanceType.INCOME ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm tracking-tight">{entry.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{entry.category} • {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-black text-lg ${entry.type === FinanceType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.type === FinanceType.INCOME ? '+' : '-'} R$ {entry.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">{entry.paymentMethod}</p>
                  </div>
                  {(store.currentUser.role === UserRole.ADMIN || store.currentUser.role === UserRole.FINANCEIRO) && (
                    <button 
                      onClick={() => {
                        if (window.confirm('Deseja realmente excluir esta movimentação?')) {
                          store.deleteFinancialEntry(entry.id);
                        }
                      }}
                      className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95"
                      title="Excluir movimentação"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="flex-1 flex items-center justify-center italic text-slate-600">Sem registros financeiros para este mês.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Entry Modal ────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-bold flex items-center gap-3"><Briefcase className="text-emerald-500" /> Registro Financeiro</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex p-1.5 bg-slate-800 rounded-2xl border border-slate-700">
                <button type="button" onClick={() => setFormData({...formData, type: FinanceType.INCOME})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === FinanceType.INCOME ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-slate-400'}`}>Entrada</button>
                <button type="button" onClick={() => setFormData({...formData, type: FinanceType.EXPENSE})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === FinanceType.EXPENSE ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/40' : 'text-slate-400'}`}>Saída</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título do Lançamento</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" placeholder="Descrição rápida" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Valor Total (R$)</label>
                  <input required type="number" step="0.01" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Data da Operação</label>
                  <input required type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoria</label>
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {FINANCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Método</label>
                  <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:border-emerald-500 outline-none transition-all" placeholder="Pix, TED..." value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                </div>
              </div>
              <button type="submit" className={`w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${formData.type === FinanceType.INCOME ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'}`}>Efetivar Operação</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Extrato Modal ────────────────────────────────────────────────────── */}
      {showExtrato && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[150] flex flex-col p-6 animate-in fade-in duration-300">
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <TrendingUp className="text-blue-400 w-8 h-8" />
                  </div>
                  Extrato Financeiro - {formatMonth(selectedMonth)}
                </h2>
                <p className="text-slate-400 mt-2 font-medium">Relatório integral de entradas e saídas do mês selecionado</p>
              </div>
              <button 
                onClick={() => setShowExtrato(false)}
                className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 pb-12">
              {[...filteredEntries].reverse().map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-7 bg-slate-900/50 border border-slate-800 rounded-[32px] hover:bg-slate-800/40 transition-all group">
                  <div className="flex items-center gap-7">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${entry.type === FinanceType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {entry.type === FinanceType.INCOME ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tight capitalize">{entry.description}</p>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-2">{entry.category} • {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      {entry.notes && <p className="text-sm text-slate-400 mt-2 italic font-medium">"{entry.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className={`font-black text-2xl ${entry.type === FinanceType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.type === FinanceType.INCOME ? '+' : '-'} R$ {entry.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50 inline-block">{entry.paymentMethod}</p>
                    </div>
                    {(store.currentUser.role === UserRole.ADMIN || store.currentUser.role === UserRole.FINANCEIRO) && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
                            store.deleteFinancialEntry(entry.id);
                          }
                        }}
                        className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                        title="Excluir movimentação"
                      >
                        <Trash2 size={22} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700 mb-6 border border-slate-800">
                    <PieChart size={40} />
                  </div>
                  <p className="text-slate-500 font-bold text-xl italic capitalize tracking-tight">Nenhum registro encontrado para {formatMonth(selectedMonth)}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Report Modal ─────────────────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[36px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f142d] via-[#1a2550] to-[#2563EB] opacity-90" />
              <div className="relative p-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <FileText className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Relatório Financeiro em PDF</h2>
                    <p className="text-blue-200 text-sm font-medium mt-0.5">TechNova Systems — {formatMonth(selectedMonth)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowReportModal(false); setPartnerError(''); }}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Blue accent bottom stripe */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
            </div>

            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {/* Quick summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Entradas', value: `R$ ${totalIncomes.toLocaleString('pt-BR', {minimumFractionDigits:2})}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Saídas',   value: `R$ ${totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits:2})}`, color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
                  { label: 'Resultado', value: `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits:2})}`,    color: balance >= 0 ? 'text-blue-400' : 'text-rose-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} border rounded-2xl p-4 text-center`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`font-black text-sm ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Partners section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-black text-white text-sm uppercase tracking-widest">Divisão de Sócios</h3>
                    <p className="text-slate-500 text-xs mt-1">A soma das porcentagens deve ser exatamente 100%</p>
                  </div>
                  <button
                    onClick={addPartner}
                    id="btn-add-socio"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    <UserPlus size={14} /> Adicionar Sócio
                  </button>
                </div>

                <div className="space-y-3">
                  {partners.map((partner, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
                      <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 font-black text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Sócio</label>
                          <input
                            type="text"
                            placeholder="Nome completo"
                            value={partner.name}
                            onChange={e => updatePartner(idx, 'name', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Porcentagem (%)</label>
                          <input
                            type="number"
                            placeholder="50"
                            min="0"
                            max="100"
                            step="0.1"
                            value={partner.percentage}
                            onChange={e => updatePartner(idx, 'percentage', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all mt-1"
                          />
                        </div>
                      </div>
                      {partners.length > 1 && (
                        <button
                          onClick={() => removePartner(idx)}
                          className="w-8 h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Percentage indicator */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden mr-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        Math.abs(totalPercentage - 100) < 0.01 ? 'bg-emerald-500' :
                        totalPercentage > 100 ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, totalPercentage)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-black tabular-nums ${
                    Math.abs(totalPercentage - 100) < 0.01 ? 'text-emerald-400' :
                    totalPercentage > 100 ? 'text-rose-400' : 'text-blue-400'
                  }`}>
                    {totalPercentage.toFixed(1)}%
                  </span>
                </div>
                {Math.abs(totalPercentage - 100) < 0.01 && (
                  <p className="text-emerald-400 text-xs font-bold mt-1 ml-1">✓ Soma correta — pronto para gerar!</p>
                )}
              </div>

              {/* Error message */}
              {partnerError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold px-5 py-3.5 rounded-2xl">
                  ⚠ {partnerError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setPartnerError(''); }}
                className="flex-1 py-3.5 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-black text-sm uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button
                id="btn-gerar-pdf-confirmar"
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className={`flex-[2] py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                  generatingPDF
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0f142d] to-[#2563EB] hover:from-[#1a2050] hover:to-[#3b82f6] text-white shadow-blue-900/40'
                }`}
              >
                {generatingPDF ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Gerando PDF...
                  </>
                ) : (
                  <><FileText size={16} /> Gerar e Baixar PDF</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
