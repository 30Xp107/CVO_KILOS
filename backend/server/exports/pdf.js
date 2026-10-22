import PDFDocument from "pdfkit";
import { LABELS, label, labels, yesNo } from "../../shared/labels.js";
import { toManilaString } from "../time.js";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 38;
const CONTENT_WIDTH = A4.width - MARGIN * 2;
const BOTTOM = 792;

const COLORS = {
  navy: "#0B4EA2",
  navyDark: "#083A79",
  blue: "#1D64C4",
  gold: "#F2B705",
  goldLight: "#FFF6D6",
  ink: "#14233B",
  muted: "#5B6C86",
  light: "#EEF4FC",
  lighter: "#F8FBFF",
  border: "#C9D7E8",
  borderDark: "#9EB4CD",
  green: "#15803D",
  white: "#FFFFFF",
  grayBg: "#F3F6FA",
};

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/₱/g, "PHP ")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/\u00a0/g, " ")
    .trim();
}

function fmtDate(value, withTime = false) {
  if (!value) return "";
  return toManilaString(value, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function list(map, values, fallback = "None provided") {
  const result = labels(map, values);
  return result.length ? result.join(", ") : fallback;
}

class KilosPdfForm {
  constructor(doc, record) {
    this.doc = doc;
    this.record = record;
    this.y = 0;
    this.pageCount = 0;
  }

  /* ------------------------------ page furniture ----------------------------- */

  addPage(full = false) {
    this.doc.addPage({ size: "A4", margins: { top: 0, left: 0, right: 0, bottom: 0 } });
    this.pageCount += 1;

    if (full) {
      this.drawCoverHeader();
      this.y = 196;
    } else {
      this.drawRunningHeader();
      this.y = 58;
    }
  }

  drawCoverHeader() {
    const { doc } = this;
    doc.save();
    doc.rect(0, 0, A4.width, 78).fill(COLORS.navy);
    doc.rect(0, 78, A4.width, 4).fill(COLORS.gold);

    // Stylised DSWD seal
    doc.circle(MARGIN + 20, 37, 20).fill(COLORS.gold);
    doc.circle(MARGIN + 20, 37, 15).lineWidth(1).strokeColor(COLORS.white).stroke();
    doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text("DSWD", MARGIN + 5, 31, { width: 30, align: "center" });
    doc
      .font("Helvetica")
      .fontSize(4.2)
      .text("WALANG GUTOM", MARGIN + 2, 41, { width: 36, align: "center" });

    doc
      .fillColor(COLORS.white)
      .font("Helvetica")
      .fontSize(5.8)
      .text("REPUBLIC OF THE PHILIPPINES", MARGIN + 52, 18, { characterSpacing: 0.8 });
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .text("Department of Social Welfare and Development", MARGIN + 52, 29, {
        width: 350,
      });
    doc
      .fillColor(COLORS.gold)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text("WALANG GUTOM PROGRAM  |  BAGONG PILIPINAS", MARGIN + 52, 45, {
        characterSpacing: 0.8,
      });

    doc
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text("KILOS", A4.width - MARGIN - 80, 24, { width: 80, align: "right" });
    doc
      .font("Helvetica")
      .fontSize(5.8)
      .text("Profiling System", A4.width - MARGIN - 80, 34, { width: 80, align: "right" });
    doc.restore();

    // Form title
    doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(11.5)
      .text(
        "KEY INFORMATION FOR LINKING OPPORTUNITIES AND SUPPORT SERVICES (KILOS) FORM",
        MARGIN,
        94,
        { width: CONTENT_WIDTH, align: "center", lineGap: 1.5 }
      );

    const region = clean(this.record.personal?.region) || "Not specified";
    doc
      .fillColor(COLORS.ink)
      .font("Helvetica-Bold")
      .fontSize(7)
      .text(`REGION: ${region}`, MARGIN, 119, { width: CONTENT_WIDTH, align: "center" });

    // Reference badge
    const badgeY = 134;
    const ref = clean(this.record.referenceNo) || "KILOS";
    doc.roundedRect(MARGIN, badgeY, 195, 20, 3).fill(COLORS.goldLight);
    doc.roundedRect(MARGIN, badgeY, 195, 20, 3).lineWidth(0.7).stroke(COLORS.gold);
    doc
      .fillColor(COLORS.navyDark)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(`REFERENCE: ${ref}`, MARGIN + 7, badgeY + 6, { width: 181 });

    const submitted = fmtDate(this.record.submittedAt, true);
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(6.8)
      .text(`Submitted: ${submitted}`, MARGIN + 205, badgeY + 6, {
        width: CONTENT_WIDTH - 205,
        align: "right",
      });

    // Data privacy notice
    const consentY = 160;
    doc.roundedRect(MARGIN, consentY, CONTENT_WIDTH, 28, 3).fill(COLORS.lighter);
    doc.roundedRect(MARGIN, consentY, CONTENT_WIDTH, 28, 3).lineWidth(0.5).stroke(COLORS.border);
    doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Oblique")
      .fontSize(5.7)
      .text(
        "I voluntarily consent to participate in this interview and to the collection and processing of my personal information for beneficiary profiling, in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173). I understand that my information will be treated confidentially and used only for its intended purposes.",
        MARGIN + 8,
        consentY + 5,
        { width: CONTENT_WIDTH - 16, lineGap: 0.7 }
      );
  }

  drawRunningHeader() {
    const { doc } = this;
    doc.save();
    doc.rect(0, 0, A4.width, 26).fill(COLORS.navy);
    doc.rect(0, 26, A4.width, 2.5).fill(COLORS.gold);
    doc
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(7.2)
      .text("KILOS PROFILING FORM", MARGIN, 9, { characterSpacing: 0.7 });
    doc
      .font("Helvetica")
      .fontSize(6.8)
      .text(
        `${clean(this.record.referenceNo)}  |  ${clean(this.record.personal?.cardHolderName) || "Beneficiary"}`,
        MARGIN + 120,
        9,
        { width: CONTENT_WIDTH - 120, align: "right", ellipsis: true }
      );
    doc.restore();
  }

  addFooter() {
    const range = this.doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      this.doc.switchToPage(range.start + i);
      const y = A4.height - 31;
      this.doc.save();
      this.doc
        .moveTo(MARGIN, y - 7)
        .lineTo(A4.width - MARGIN, y - 7)
        .lineWidth(0.5)
        .strokeColor(COLORS.border)
        .stroke();
      this.doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(5.8)
        .text(
          "DSWD Walang Gutom Program  |  KILOS Profiling  |  Confidential personal information",
          MARGIN,
          y,
          { width: CONTENT_WIDTH - 90 }
        );
      this.doc
        .font("Helvetica-Bold")
        .fontSize(6.2)
        .fillColor(COLORS.navy)
        .text(`Page ${i + 1} of ${range.count}`, A4.width - MARGIN - 90, y, {
          width: 90,
          align: "right",
        });
      this.doc.restore();
    }
  }

  /* -------------------------------- layout ---------------------------------- */

  ensure(height) {
    if (this.y + height > BOTTOM) {
      this.addPage(false);
    }
  }

  gap(value = 6) {
    this.y += value;
  }

  sectionBar(title, note = "") {
    const height = 19;
    this.ensure(height + 8);
    this.doc.rect(MARGIN, this.y, CONTENT_WIDTH, height).fill(COLORS.navy);
    this.doc.rect(MARGIN, this.y, 4, height).fill(COLORS.gold);
    this.doc
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .fontSize(7.9)
      .text(title.toUpperCase(), MARGIN + 10, this.y + 6.2, {
        width: CONTENT_WIDTH - 130,
        characterSpacing: 0.4,
      });
    if (note) {
      this.doc
        .font("Helvetica")
        .fontSize(5.9)
        .fillColor("#D9E6F7")
        .text(note, A4.width - MARGIN - 150, this.y + 7.2, {
          width: 140,
          align: "right",
        });
    }
    this.y += height + 5;
  }

  subBar(title) {
    this.ensure(16);
    this.doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(7.4)
      .text(title.toUpperCase(), MARGIN, this.y, { width: CONTENT_WIDTH });
    this.y += 9;
    this.doc
      .moveTo(MARGIN, this.y)
      .lineTo(A4.width - MARGIN, this.y)
      .lineWidth(0.6)
      .strokeColor(COLORS.gold)
      .stroke();
    this.y += 5;
  }

  hint(text) {
    if (!text) return;
    this.ensure(10);
    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Oblique")
      .fontSize(5.9)
      .text(clean(text), MARGIN, this.y, { width: CONTENT_WIDTH });
    this.y += 9;
  }

  fieldRow(items) {
    const gap = 5;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    const available = CONTENT_WIDTH - gap * (items.length - 1);
    const widths = items.map((item) => (available * (item.weight || 1)) / totalWeight);

    const heights = items.map((item, index) => {
      const value = clean(item.value) || "—";
      const contentHeight = this.doc.heightOfString(value, {
        width: widths[index] - 10,
        align: "left",
        lineGap: 1.4,
      });
      return Math.max(item.minHeight || 30, contentHeight + 19);
    });
    const rowHeight = Math.max(...heights);
    this.ensure(rowHeight + 5);

    let x = MARGIN;
    items.forEach((item, index) => {
      const w = widths[index];
      this.doc.rect(x, this.y, w, rowHeight).fillAndStroke(COLORS.lighter, COLORS.border);
      this.doc.rect(x, this.y, w, 2).fill(item.accent || COLORS.light);
      this.doc
        .fillColor(COLORS.muted)
        .font("Helvetica-Bold")
        .fontSize(5.7)
        .text(clean(item.label).toUpperCase(), x + 5, this.y + 5, {
          width: w - 10,
          height: 8,
          ellipsis: true,
          characterSpacing: 0.2,
        });
      this.doc
        .fillColor(COLORS.ink)
        .font(item.italic ? "Helvetica-Oblique" : "Helvetica")
        .fontSize(item.size || 8)
        .text(clean(item.value) || "—", x + 5, this.y + 15, {
          width: w - 10,
          lineGap: 1.4,
        });
      x += w + gap;
    });

    this.y += rowHeight + 5;
  }

  paragraph(labelText, value) {
    const text = clean(value) || "—";
    const textWidth = CONTENT_WIDTH - 10;
    const h = Math.max(30, this.doc.heightOfString(text, { width: textWidth, lineGap: 1.5 }) + 19);
    this.ensure(h + 5);
    this.doc.rect(MARGIN, this.y, CONTENT_WIDTH, h).fillAndStroke(COLORS.lighter, COLORS.border);
    this.doc.rect(MARGIN, this.y, 3, h).fill(COLORS.light);
    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Bold")
      .fontSize(5.7)
      .text(clean(labelText).toUpperCase(), MARGIN + 7, this.y + 5, {
        characterSpacing: 0.2,
      });
    this.doc
      .fillColor(COLORS.ink)
      .font("Helvetica")
      .fontSize(8)
      .text(text, MARGIN + 7, this.y + 15, { width: textWidth, lineGap: 1.4 });
    this.y += h + 5;
  }

  checkboxItems(items, selected = [], columns = 3, options = {}) {
    const selectedSet = new Set(selected || []);
    const gap = 6;
    const colWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
    const rows = [];
    for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));

    if (options.title) {
      this.ensure(11);
      this.doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(6.8)
        .text(options.title, MARGIN, this.y, { width: CONTENT_WIDTH });
      this.y += 9.5;
    }

    rows.forEach((row) => {
      const heights = row.map((item) =>
        Math.max(
          10,
          this.doc.heightOfString(clean(item.label), {
            width: colWidth - 15,
            lineGap: 0.8,
          }) + 2.5
        )
      );
      const rowHeight = Math.max(...heights) + 3.5;
      this.ensure(rowHeight);
      row.forEach((item, index) => {
        const x = MARGIN + index * (colWidth + gap);
        const checked = selectedSet.has(item.value);
        const boxY = this.y + 1.5;
        this.doc
          .rect(x, boxY, 7.2, 7.2)
          .lineWidth(0.7)
          .fillAndStroke(checked ? COLORS.navy : COLORS.white, checked ? COLORS.navy : COLORS.borderDark);
        if (checked) {
          this.doc
            .save()
            .moveTo(x + 1.7, boxY + 3.7)
            .lineTo(x + 3.1, boxY + 5.3)
            .lineTo(x + 5.7, boxY + 1.8)
            .lineWidth(1)
            .strokeColor(COLORS.white)
            .stroke()
            .restore();
        }
        this.doc
          .fillColor(COLORS.ink)
          .font(checked ? "Helvetica-Bold" : "Helvetica")
          .fontSize(6.6)
          .text(clean(item.label), x + 11, this.y, {
            width: colWidth - 13,
            lineGap: 0.8,
          });
      });
      this.y += rowHeight;
      if (options.compact) this.y -= 1;
    });
    this.y += options.after || 4;
  }

  groupBlocks(groups, selected = [], columns = 4) {
    const selectedSet = new Set(selected || []);
    const gap = 7;
    const colWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;

    const prepared = groups.map((group) => {
      const itemHeights = group.items.map(
        (item) =>
          Math.max(
            9.5,
            this.doc.heightOfString(clean(item.label), {
              width: colWidth - 13,
              lineGap: 0.6,
            }) + 1.8
          )
      );
      const height =
        11 +
        this.doc.heightOfString(group.title, { width: colWidth - 4, lineGap: 0.7 }) +
        itemHeights.reduce((a, b) => a + b, 0) +
        3;
      return { group, itemHeights, height };
    });

    for (let start = 0; start < prepared.length; start += columns) {
      const chunk = prepared.slice(start, start + columns);
      const blockHeight = Math.max(...chunk.map((entry) => entry.height));
      this.ensure(blockHeight + 4);

      chunk.forEach((entry, index) => {
        const x = MARGIN + index * (colWidth + gap);
        let y = this.y;
        this.doc
          .fillColor(COLORS.navy)
          .font("Helvetica-Bold")
          .fontSize(6.4)
          .text(clean(entry.group.title), x, y, { width: colWidth - 2, lineGap: 0.7 });
        y +=
          this.doc.heightOfString(entry.group.title, { width: colWidth - 2, lineGap: 0.7 }) + 2;

        entry.group.items.forEach((item, itemIndex) => {
          const checked = selectedSet.has(item.value);
          this.doc
            .rect(x, y + 0.8, 6.4, 6.4)
            .lineWidth(0.6)
            .fillAndStroke(checked ? COLORS.navy : COLORS.white, checked ? COLORS.navy : COLORS.borderDark);
          if (checked) {
            this.doc
              .save()
              .moveTo(x + 1.4, y + 3.3)
              .lineTo(x + 2.6, y + 4.8)
              .lineTo(x + 5, y + 1.6)
              .lineWidth(0.9)
              .strokeColor(COLORS.white)
              .stroke()
              .restore();
          }
          this.doc
            .fillColor(COLORS.ink)
            .font(checked ? "Helvetica-Bold" : "Helvetica")
            .fontSize(6.2)
            .text(clean(item.label), x + 9.5, y, {
              width: colWidth - 11,
              lineGap: 0.6,
            });
          y += entry.itemHeights[itemIndex];
        });
      });

      this.y += blockHeight + 4;
    }
    this.y += 2;
  }

  priorityTable(interests = [], priorities = {}) {
    const map = {
      skills_training: "skillsTraining",
      employment: "employment",
      livelihood: "livelihood",
      education: "education",
      other: "other",
    };
    const rows = LABELS.assistance ? Object.keys(LABELS.assistance) : [];
    const x = MARGIN;
    const widths = [CONTENT_WIDTH - 130, 60, 70];
    const headerHeight = 16;
    this.ensure(headerHeight + rows.length * 15 + 10);

    this.doc.rect(x, this.y, widths[0], headerHeight).fillAndStroke(COLORS.light, COLORS.border);
    this.doc.rect(x + widths[0], this.y, widths[1], headerHeight).fillAndStroke(COLORS.light, COLORS.border);
    this.doc
      .rect(x + widths[0] + widths[1], this.y, widths[2], headerHeight)
      .fillAndStroke(COLORS.light, COLORS.border);
    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Bold")
      .fontSize(5.8)
      .text("ASSISTANCE INTERESTED IN", x + 5, this.y + 5);
    this.doc.text("SELECT", x + widths[0], this.y + 5, { width: widths[1], align: "center" });
    this.doc.text("PRIORITY", x + widths[0] + widths[1], this.y + 5, {
      width: widths[2],
      align: "center",
    });
    this.y += headerHeight;

    Object.entries(LABELS.assistance).forEach(([code, text], index) => {
      const checked = (interests || []).includes(code);
      const priority = priorities?.[map[code]];
      const rowY = this.y;
      this.doc.rect(x, rowY, widths[0], 15).fillAndStroke(index % 2 ? COLORS.lighter : COLORS.white, COLORS.border);
      this.doc.rect(x + widths[0], rowY, widths[1], 15).fillAndStroke(index % 2 ? COLORS.lighter : COLORS.white, COLORS.border);
      this.doc.rect(x + widths[0] + widths[1], rowY, widths[2], 15).fillAndStroke(index % 2 ? COLORS.lighter : COLORS.white, COLORS.border);
      this.doc.rect(x + 5, rowY + 4, 7, 7).lineWidth(0.6).fillAndStroke(checked ? COLORS.navy : COLORS.white, checked ? COLORS.navy : COLORS.borderDark);
      if (checked) {
        this.doc
          .save()
          .moveTo(x + 6.6, rowY + 7.3)
          .lineTo(x + 8, rowY + 9)
          .lineTo(x + 10.4, rowY + 5.7)
          .lineWidth(0.9)
          .strokeColor(COLORS.white)
          .stroke()
          .restore();
      }
      this.doc
        .fillColor(COLORS.ink)
        .font(checked ? "Helvetica-Bold" : "Helvetica")
        .fontSize(6.7)
        .text(text, x + 16, rowY + 4.5, { width: widths[0] - 20 });
      this.doc
        .fillColor(checked ? COLORS.navy : COLORS.muted)
        .font("Helvetica-Bold")
        .fontSize(6.7)
        .text(checked ? "YES" : "-", x + widths[0], rowY + 4.5, {
          width: widths[1],
          align: "center",
        });
      this.doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(priority ? `# ${priority}` : "-", x + widths[0] + widths[1], rowY + 4.2, {
          width: widths[2],
          align: "center",
        });
      this.y += 15;
    });
    this.y += 5;
  }

  householdTable(members = []) {
    const widths = [118, 58, 30, 26, 55, 82, 82, 68];
    const headers = [
      "Name",
      "Relationship to Cardholder",
      "Sex",
      "Age",
      "IP Affiliation (if applicable)",
      "Current Employment / Education Status",
      "Course / Skills Acquired",
      "Assistance Needed",
    ];
    const x = MARGIN;
    const drawHeader = () => {
      const headerHeight = 22;
      this.ensure(headerHeight + 6);
      let cx = x;
      headers.forEach((header, index) => {
        this.doc
          .rect(cx, this.y, widths[index], headerHeight)
          .fillAndStroke(COLORS.light, COLORS.border);
        this.doc
          .fillColor(COLORS.muted)
          .font("Helvetica-Bold")
          .fontSize(5.4)
          .text(header.toUpperCase(), cx + 3, this.y + 4, {
            width: widths[index] - 6,
            align: "center",
            lineGap: 0.6,
          });
        cx += widths[index];
      });
      this.y += headerHeight;
    };

    drawHeader();

    const rows = (members || []).filter((m) => m.name || m.relationship);
    if (rows.length === 0) {
      const h = 20;
      this.ensure(h);
      this.doc.rect(x, this.y, CONTENT_WIDTH, h).fillAndStroke(COLORS.white, COLORS.border);
      this.doc
        .fillColor(COLORS.muted)
        .font("Helvetica-Oblique")
        .fontSize(6.5)
        .text("No other household members listed.", x + 6, this.y + 7, {
          width: CONTENT_WIDTH - 12,
        });
      this.y += h + 3;
      return;
    }

    rows.forEach((member) => {
      const values = [
        member.name,
        member.relationship,
        member.sex,
        member.age,
        member.ipAffiliation,
        member.employmentStatus,
        member.courseSkills,
        member.assistanceNeeded,
      ].map((value) => clean(value) || "—");

      const cellHeights = values.map(
        (value, index) =>
          this.doc.heightOfString(value, {
            width: widths[index] - 6,
            lineGap: 0.8,
          }) + 6
      );
      const rowHeight = Math.max(19, ...cellHeights);

      if (this.y + rowHeight > BOTTOM) {
        this.addPage(false);
        drawHeader();
      }

      let cx = x;
      values.forEach((value, index) => {
        this.doc.rect(cx, this.y, widths[index], rowHeight).fillAndStroke(COLORS.white, COLORS.border);
        this.doc
          .fillColor(COLORS.ink)
          .font("Helvetica")
          .fontSize(6.2)
          .text(value, cx + 3, this.y + 3, {
            width: widths[index] - 6,
            lineGap: 0.8,
          });
        cx += widths[index];
      });
      this.y += rowHeight;
    });
    this.y += 5;
  }

  signatureBlock() {
    const consent = this.record.consent || {};
    const staff = this.record.staff || {};
    this.ensure(118);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_WIDTH, 104, 3).fillAndStroke(COLORS.lighter, COLORS.border);
    this.doc
      .fillColor(COLORS.navy)
      .font("Helvetica-Bold")
      .fontSize(7.6)
      .text("PAGPAPATUNAY AT PAHINTULOT", MARGIN, this.y + 8, {
        width: CONTENT_WIDTH,
        align: "center",
        characterSpacing: 0.5,
      });
    this.doc
      .fillColor(COLORS.ink)
      .font("Helvetica")
      .fontSize(5.7)
      .text(
        "Bilang benepisyaryo ng Walang Gutom Program, pinatutunayan ko na ang lahat ng impormasyong ibinigay ko ay totoo at tama. Sumasang-ayon din ako na makibahagi at makipagtulungan sa mga oportunidad, programa, at serbisyong maaaring maiugnay sa akin batay sa aking mga pangangailangan at interes, at na ang impormasyong aking ibinigay ay maaaring gamitin para sa beneficiary profiling, referral, at pag-uugnay sa mga kaukulang programa at serbisyo.",
        MARGIN + 14,
        this.y + 20,
        { width: CONTENT_WIDTH - 28, align: "center", lineGap: 1.2 }
      );

    const sigY = this.y + 64;
    this.doc
      .moveTo(MARGIN + 150, sigY)
      .lineTo(MARGIN + 370, sigY)
      .lineWidth(0.6)
      .strokeColor(COLORS.muted)
      .stroke();
    this.doc
      .fillColor(COLORS.navyDark)
      .font("Helvetica-Oblique")
      .fontSize(sigY ? 10 : 10)
      .text(clean(consent.signedName) || "—", MARGIN + 150, sigY - 15, {
        width: 220,
        align: "center",
      });
    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(5.8)
      .text("Pangalan at lagda ng Benepisyaryo", MARGIN + 150, sigY + 2, {
        width: 220,
        align: "center",
      });
    this.doc
      .fillColor(COLORS.ink)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(
        `Interview End Time: ${clean(consent.interviewEndTime) || "—"}`,
        A4.width - MARGIN - 145,
        sigY + 2,
        { width: 130, align: "right" }
      );
    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(5.5)
      .text(
        `Consent given: ${consent.agreed ? "Yes" : "No"}   |   Signed: ${clean(consent.signedName) || "—"}`,
        MARGIN,
        this.y + 94,
        { width: CONTENT_WIDTH, align: "right" }
      );
    this.y += 109;

    this.doc
      .fillColor(COLORS.muted)
      .font("Helvetica-Oblique")
      .fontSize(6)
      .text(
        `Interviewed / profiled by: ${clean(staff.interviewedBy) || "—"}  (${clean(staff.position) || "—"})   |   ${clean(staff.office) || "—"}`,
        MARGIN,
        this.y,
        { width: CONTENT_WIDTH }
      );
    this.y += 11;
  }

  /* --------------------------------- pages ---------------------------------- */

  render() {
    this.addPage(true);

    /* ------------------------------ A. Personal ------------------------------ */
    this.sectionBar("A. Personal Information", "Beneficiary profile");

    const p = this.record.personal || {};
    this.fieldRow([
      {
        label: "Card Holder / Household Head Name (Last Name, First Name, M.I.)",
        value: p.cardHolderName,
        weight: 3,
      },
      { label: "Suffix (Sr., Jr.)", value: p.suffix, weight: 1 },
    ]);
    this.fieldRow([
      { label: "Household ID No.", value: p.householdId, weight: 1 },
      { label: "Month & Year Onboarded", value: p.onboarded, weight: 1 },
      { label: "Region", value: p.region, weight: 1 },
      { label: "Interview Start Time", value: p.interviewStartTime, weight: 1 },
    ]);
    this.paragraph("Address", p.address);

    this.subBar("Beneficiary to be Profiled");
    this.checkboxItems(
      [
        { value: "head", label: "Household Head / Cardholder" },
        { value: "member", label: "Household Member" },
      ],
      p.beneficiaryType ? [p.beneficiaryType] : [],
      2
    );
    this.fieldRow([
      { label: "Relationship to HH Head", value: p.relationshipToHH },
      { label: "Name of Household Member (Last Name, First Name, M.I.)", value: p.memberName, weight: 2 },
    ]);

    this.subBar("Respondent Information");
    this.fieldRow([
      { label: "Age", value: p.age, weight: 0.7 },
      { label: "Sex", value: p.sex, weight: 0.9 },
      { label: "Birthday (dd/mm/yy)", value: p.birthday, weight: 1.2 },
      { label: "Civil Status", value: p.civilStatus, weight: 1 },
    ]);
    this.fieldRow([
      { label: "Contact No.", value: p.contactNo, weight: 1.2 },
      { label: "Citizenship", value: p.citizenship, weight: 1 },
      { label: "Religion", value: p.religion, weight: 1 },
    ]);
    this.fieldRow([
      { label: "Highest Educational Attainment", value: p.highestEducation, weight: 2 },
      { label: "Year Graduated / Last Attended", value: p.yearGraduated, weight: 1 },
    ]);

    this.subBar("Sectoral or Vulnerability Group");
    this.checkboxItems(
      Object.entries(LABELS.sectors).map(([value, text]) => ({ value, label: text })),
      p.sectors || [],
      3
    );
    this.fieldRow([
      { label: "Specify", value: p.sectorSpecify },
      { label: "Others", value: p.sectorOthers },
    ]);

    this.subBar("Dialect");
    this.checkboxItems(
      Object.entries(LABELS.dialects).map(([value, text]) => ({ value, label: text })),
      p.dialects || [],
      4
    );
    this.fieldRow([{ label: "Others (please specify)", value: p.dialectOthers }]);

    this.sectionBar(
      "Other Household Members Interested In or Requiring Opportunities and Support Services",
      "Accomplish only if applicable"
    );
    this.householdTable(this.record.householdMembers);

    /* ------------------------------- B. Skills ------------------------------- */
    this.addPage(false);
    this.sectionBar("B. Skills and Livelihood Experience Profile");

    const s = this.record.skills || {};
    this.subBar("Training Participation and Competency");
    this.checkboxItems(
      [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      s.previouslyParticipated ? [s.previouslyParticipated] : [],
      2
    );
    this.fieldRow([{ label: "If yes, please specify", value: s.participationSpecify }]);
    this.checkboxItems(
      Object.entries(LABELS.competency).map(([value, text]) => ({ value, label: text })),
      s.competencyLevel ? [s.competencyLevel] : [],
      4,
      { title: "Competency Level" }
    );

    this.subBar("Work, Livelihood, or Income-Generating Activities with Experience");
    this.groupBlocks(
      [
        {
          title: "Agriculture and Natural Resources",
          items: [
            { value: "farming", label: "Farming" },
            { value: "fishing", label: "Fishing" },
            { value: "livestock", label: "Livestock Raising" },
            { value: "gardening", label: "Gardening" },
          ],
        },
        {
          title: "Skilled Trades and Construction",
          items: [
            { value: "construction", label: "Construction Work" },
            { value: "carpentry", label: "Carpentry" },
            { value: "electrical", label: "Electrical Work" },
            { value: "welding", label: "Welding" },
            { value: "repair", label: "Repair and Maintenance Services" },
          ],
        },
        {
          title: "Food, Hospitality, and Service",
          items: [
            { value: "food_vending", label: "Food Vending" },
            { value: "cooking", label: "Cooking and Food Preparation" },
            { value: "bread_pastry", label: "Bread and Pastry Production" },
            { value: "housekeeping", label: "Housekeeping" },
            { value: "food_beverage", label: "Food and Beverage Service" },
          ],
        },
        {
          title: "Transportation and Logistics",
          items: [
            { value: "driving", label: "Driving" },
            { value: "delivery", label: "Delivery Services" },
          ],
        },
        {
          title: "Household and Personal Services",
          items: [
            { value: "laundry", label: "Laundry and Ironing Services" },
            { value: "house_cleaning", label: "House Cleaning Services" },
            { value: "childcare", label: "Childcare and Caregiving" },
            { value: "beauty", label: "Beauty and Personal Care Services" },
            { value: "massage", label: "Massage and Wellness Services" },
            { value: "sewing", label: "Sewing and Dressmaking" },
          ],
        },
        {
          title: "Office and Administrative Services",
          items: [
            { value: "admin_work", label: "Office / Administrative Work" },
            { value: "cashier", label: "Cashier" },
            { value: "customer_service", label: "Customer Services" },
            { value: "gov_staff", label: "Government Office Staff" },
            { value: "private_staff", label: "Private Company Office Staff" },
            { value: "computer", label: "Computer-related Services" },
          ],
        },
        {
          title: "Selling and Business Activities",
          items: [
            { value: "online_seller", label: "Online Seller" },
            { value: "selling_marketing", label: "Selling and Marketing" },
            { value: "sari_sari", label: "Sari-Sari Store" },
          ],
        },
        {
          title: "Community and Other Services",
          items: [
            { value: "street_sweeping", label: "Street Sweeping" },
            { value: "waste", label: "Waste Collection and Recycling" },
            { value: "janitor", label: "Janitor" },
            { value: "security", label: "Security Guard" },
          ],
        },
      ],
      s.experiences || [],
      4
    );
    this.fieldRow([{ label: "Others (please specify)", value: s.experiencesOthers }]);

    this.subBar("Current Level of Involvement and Income");
    this.checkboxItems(
      Object.entries(LABELS.involvement).map(([value, text]) => ({ value, label: text })),
      s.involvement ? [s.involvement] : [],
      3,
      { title: "For the activities selected above, which best describes your current level of involvement?" }
    );
    this.checkboxItems(
      Object.entries(LABELS.earning).map(([value, text]) => ({ value, label: text })),
      s.earningIncome ? [s.earningIncome] : [],
      3,
      { title: "Are you currently earning income from any of the activities selected above?" }
    );
    this.checkboxItems(
      Object.entries(LABELS.income).map(([value, text]) => ({ value, label: text })),
      s.monthlyIncome ? [s.monthlyIncome] : [],
      3,
      { title: "Estimated average monthly income from these activities" }
    );
    this.fieldRow([{ label: "If yes, which activity is your primary source of income?", value: s.primaryIncomeSource }]);

    /* --------------------------- C. Opportunities ---------------------------- */
    this.addPage(false);
    this.sectionBar("C. Opportunities and Support Services Interest", "Check all that apply");

    const o = this.record.opportunities || {};
    this.priorityTable(o.assistanceInterests || [], o.priorities || {});
    this.fieldRow([
      { label: "Other Support Services (specify)", value: o.otherAssistance, weight: 2 },
      { label: "All selected priorities summary", value: this.prioritySummary(o), weight: 2 },
    ]);

    const st = o.skillsTraining || {};
    const hasSkills = (o.assistanceInterests || []).includes("skills_training");
    this.sectionBar(
      "I. Skills Training",
      hasSkills ? "Complete - selected" : "Not selected"
    );
    this.checkboxItems(
      Object.entries(LABELS.durations).map(([value, text]) => ({ value, label: text })),
      st.duration ? [st.duration] : [],
      4,
      { title: "Preferred Training Duration" }
    );
    this.subBar("Preferred Training Schedule");
    this.checkboxItems(
      Object.entries(LABELS.timeOfDay).map(([value, text]) => ({ value, label: text })),
      st.weekdays || [],
      3,
      { title: "Weekdays" }
    );
    this.checkboxItems(
      Object.entries(LABELS.timeOfDay).map(([value, text]) => ({ value, label: text })),
      st.weekends || [],
      3,
      { title: "Weekends" }
    );

    this.subBar("Training or Capacity Development Activities Interested In");
    this.groupBlocks(
      [
        {
          title: "Tourism, Hospitality and Services",
          items: [
            { value: "housekeeping_training", label: "Housekeeping" },
            { value: "fbs_training", label: "Food and Beverage Services" },
            { value: "table_skirting", label: "Table Skirting" },
          ],
        },
        {
          title: "Information Technology",
          items: [
            { value: "computer_system", label: "Computer System Servicing" },
            { value: "animation", label: "Animation" },
            { value: "contact_center", label: "Contact Center Services" },
          ],
        },
        {
          title: "Agriculture and Natural Resources",
          items: [
            { value: "organic_agri", label: "Organic Agriculture Production" },
            { value: "crops_training", label: "Agricultural Crops Production" },
            { value: "animal_production", label: "Animal Production" },
            { value: "landscaping", label: "Landscaping" },
          ],
        },
        {
          title: "Construction and Automotive",
          items: [
            { value: "smaw", label: "Shield Metal Arc Welding (SMAW)" },
            { value: "carpentry_training", label: "Carpentry" },
            { value: "masonry", label: "Masonry" },
            { value: "electrical_installation", label: "Electrical Installation and Maintenance" },
            { value: "automotive", label: "Automotive Servicing" },
            { value: "driving_training", label: "Driving" },
            { value: "construction_painting", label: "Construction Painting" },
          ],
        },
        {
          title: "Food Production and Processing",
          items: [
            { value: "food_processing", label: "Food Processing" },
            { value: "bread_pastry_production", label: "Bread and Pastry Production" },
            { value: "cookery", label: "Cookery" },
          ],
        },
        {
          title: "Household and Personal Services",
          items: [
            { value: "dressmaking_training", label: "Dressmaking" },
            { value: "massage_therapy", label: "Massage Therapy" },
            { value: "cosmetology", label: "Cosmetology" },
          ],
        },
        {
          title: "Entrepreneurship and Business Development",
          items: [
            { value: "financial_literacy", label: "Financial Literacy" },
            { value: "bookkeeping", label: "Bookkeeping" },
          ],
        },
      ],
      st.activities || [],
      4
    );
    this.fieldRow([{ label: "Others (specify)", value: st.others }]);

    /* ----------------------------- II. Employment ---------------------------- */
    this.addPage(false);
    this.sectionBar("II. Employment Profile", (o.assistanceInterests || []).includes("employment") ? "Complete - selected" : "Not selected");
    const emp = o.employment || {};
    this.checkboxItems(
      Object.entries(LABELS.employmentStatus).map(([value, text]) => ({ value, label: text })),
      emp.status || [],
      3,
      { title: "Current Employment Status" }
    );
    this.fieldRow([{ label: "Others, please specify", value: emp.statusOthers }]);
    this.checkboxItems(
      Object.entries(LABELS.availability).map(([value, text]) => ({ value, label: text })),
      emp.availability ? [emp.availability] : [],
      4,
      { title: "Availability for Employment" }
    );
    this.checkboxItems(
      [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      emp.jobFair ? [emp.jobFair] : [],
      2,
      { title: "Willing to attend Job Fairs and comply with employers' requirements?" }
    );
    this.checkboxItems(
      Object.entries(LABELS.documents).map(([value, text]) => ({ value, label: text })),
      emp.documents || [],
      4,
      { title: "Employment Documents Available" }
    );
    this.checkboxItems(
      Object.entries(LABELS.employmentSectors).map(([value, text]) => ({ value, label: text })),
      emp.sectors || [],
      3,
      { title: "Preferred Employment Sector" }
    );
    this.fieldRow([{ label: "Others (specify)", value: emp.others }]);

    /* ----------------------------- III. Livelihood --------------------------- */
    this.sectionBar("III. Livelihood Profile", (o.assistanceInterests || []).includes("livelihood") ? "Complete - selected" : "Not selected");
    const live = o.livelihood || {};
    this.checkboxItems(
      [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      live.existing ? [live.existing] : [],
      2,
      { title: "Do you currently have an existing livelihood or small business?" }
    );
    this.fieldRow([
      { label: "If yes, please specify", value: live.existingSpecify },
      { label: "Type of livelihood / business", value: live.type },
      { label: "Duration of Operation", value: live.duration },
    ]);
    this.checkboxItems(
      [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      live.received ? [live.received] : [],
      2,
      { title: "Have you previously received any livelihood assistance or support?" }
    );
    this.fieldRow([
      { label: "If yes, please specify", value: live.receivedSpecify },
      { label: "Agency / Program source (e.g. SLP, DTI, DA, LGU, NGO)", value: live.agency },
    ]);
    this.fieldRow([
      { label: "Year Received", value: live.yearReceived },
      { label: "Type of Assistance Received", value: live.assistanceType },
    ]);
    this.subBar("Type of Livelihood Interested In");
    this.groupBlocks(
      [
        {
          title: "Retail and Trading",
          items: [
            { value: "sari_sari_livelihood", label: "Sari-Sari Store" },
            { value: "agri_supplies", label: "Agricultural Supplies" },
            { value: "crop_production_business", label: "Crop Production / Farming" },
            { value: "startup_capital", label: "Start-up Capital" },
            { value: "expansion", label: "Expansion of Existing Business" },
          ],
        },
        {
          title: "Food and Services",
          items: [
            { value: "street_vending", label: "Street Vending" },
            { value: "catering", label: "Catering Services" },
            { value: "baking_pastry", label: "Baking and Pastry Production" },
            { value: "food_processing_livelihood", label: "Food Processing" },
            { value: "food_stall", label: "Food Stall" },
          ],
        },
        {
          title: "Agriculture and Livestock",
          items: [
            { value: "poultry", label: "Poultry Raising" },
            { value: "crop_farming", label: "Crop Farming" },
            { value: "vegetable_gardening", label: "Vegetable Gardening" },
            { value: "fishing_livelihood", label: "Fishing" },
            { value: "hog_raising", label: "Hog Raising" },
          ],
        },
        {
          title: "Production and Handicrafts",
          items: [
            { value: "dressmaking_livelihood", label: "Dressmaking" },
            { value: "handicraft", label: "Handicraft Making" },
            { value: "furniture", label: "Furniture or Woodcraft Production" },
            { value: "tailoring", label: "Tailoring" },
            { value: "soap_candle", label: "Soap or Candle Making" },
          ],
        },
      ],
      live.interests || [],
      4
    );
    this.fieldRow([{ label: "Others (specify)", value: live.others }]);

    /* ----------------------------- IV. Education ----------------------------- */
    this.addPage(false);
    this.sectionBar("IV. Education Support Profile", (o.assistanceInterests || []).includes("education") ? "Complete - selected" : "Not selected");
    const edu = o.education || {};
    this.checkboxItems(
      Object.entries(LABELS.education).map(([value, text]) => ({ value, label: text })),
      edu.opportunities || [],
      2,
      { title: "What type of educational or learning opportunity are you interested in?" }
    );
    this.fieldRow([{ label: "Other Educational Opportunities (specify)", value: edu.otherOpportunity }]);
    this.checkboxItems(
      Object.entries(LABELS.interest).map(([value, text]) => ({ value, label: text })),
      edu.interest12Months ? [edu.interest12Months] : [],
      3,
      { title: "Interested in educational or learning opportunities within the next 12 months?" }
    );
    this.checkboxItems(
      Object.entries(LABELS.learningMode).map(([value, text]) => ({ value, label: text })),
      edu.learningMode || [],
      4,
      { title: "Preferred Learning Mode" }
    );
    this.checkboxItems(
      Object.entries(LABELS.schedule).map(([value, text]) => ({ value, label: text })),
      edu.schedule || [],
      2,
      { title: "Preferred Class Schedule" }
    );
    this.checkboxItems(
      [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      edu.alsAttended ? [edu.alsAttended] : [],
      2,
      { title: "If interested in ALS, have you previously attended the Alternative Learning System?" }
    );
    this.fieldRow([{ label: "If yes, specify program / level", value: edu.alsProgram }]);
    this.checkboxItems(
      Object.entries(LABELS.alsStatus).map(([value, text]) => ({ value, label: text })),
      edu.alsStatus ? [edu.alsStatus] : [],
      3,
      { title: "Current Status in the ALS" }
    );
    this.fieldRow([{ label: "Other ALS status (specify)", value: edu.alsStatusOther }]);

    /* -------------------------- V. Specialized support ----------------------- */
    this.sectionBar("V. Specialized Support Services Profile");
    const spec = o.specialized || {};
    this.checkboxItems(
      Object.entries(LABELS.specialized).map(([value, text]) => ({ value, label: text })),
      spec.types || [],
      2,
      { title: "Type of Assistance, Support, and Referral Needed" }
    );
    this.fieldRow([{ label: "Others (specify)", value: spec.others }]);

    /* ----------------------------- D. Constraints ---------------------------- */
    const c = this.record.constraints || {};
    this.sectionBar("D. Participation Constraints and Support Needs");
    this.groupBlocks(
      [
        {
          title: "Financial and Material Barriers",
          items: [
            { value: "capital", label: "Lack of capital or starting funds" },
            { value: "transport", label: "High cost of transportation to training/work sites" },
            { value: "allowance", label: "Lack of allowance for daily food or school supplies" },
            { value: "tools", label: "No access to tools, equipment, or laptops/smartphones" },
          ],
        },
        {
          title: "Personal and Family Constraints",
          items: [
            { value: "childcare", label: "Childcare responsibilities or lack of a helper at home" },
            { value: "caretaker", label: "Caretaker duties for an elderly or sick family member" },
            { value: "family_responsibilities", label: "Family responsibilities affecting participation" },
            { value: "health", label: "Health conditions or physical limitations" },
          ],
        },
        {
          title: "Community and Environmental Barriers",
          items: [
            { value: "remote", label: "Remote location / lack of accessible public transport" },
            { value: "internet", label: "Unstable internet connection or frequent power outages" },
            { value: "safety", label: "Safety or security concerns in the community" },
            { value: "disasters", label: "Affected by recent natural disasters or calamities" },
            { value: "opportunities", label: "Lack of available opportunities nearby" },
          ],
        },
        {
          title: "Skills and Institutional Barriers",
          items: [
            { value: "documents", label: "Lack of required documents (IDs, PSA, NBI, etc.)" },
            { value: "education_barrier", label: "Low educational attainment or lack of official certifications" },
            { value: "language", label: "Language barrier or difficulty in reading/writing" },
          ],
        },
      ],
      c.types || [],
      4
    );
    this.fieldRow([{ label: "Others (specify)", value: c.others }]);

    /* -------------------------- E. Goals and readiness ----------------------- */
    this.addPage(false);
    this.sectionBar("E. Goals and Readiness");
    const g = this.record.goals || {};
    this.checkboxItems(
      Object.entries(LABELS.goals).map(([value, text]) => ({ value, label: text })),
      g.types || [],
      2,
      { title: "Primary long-term goal after finishing this program" }
    );
    this.fieldRow([{ label: "Others (specify)", value: g.others }]);
    this.checkboxItems(
      Object.entries(LABELS.readiness).map(([value, text]) => ({ value, label: text })),
      g.readiness ? [g.readiness] : [],
      3,
      { title: "Commitment and Readiness" }
    );
    this.fieldRow([{ label: "Reason / support needed", value: g.readinessReason }]);

    this.signatureBlock();

    /* ----------------------------- Staff use only --------------------------- */
    const staff = this.record.staff || {};
    this.sectionBar("KILOS Profiling Result", "FOR STAFF USE ONLY");

    this.checkboxItems(
      Object.entries(LABELS.referralPathways).map(([value, text]) => ({ value, label: text })),
      staff.referralPathways || [],
      2,
      { title: "Possible Referral Pathway(s)" }
    );
    this.checkboxItems(
      Object.entries(LABELS.partners).map(([value, text]) => ({ value, label: text })),
      staff.partners || [],
      2,
      { title: "Potential Referral Partner(s)" }
    );
    this.fieldRow([
      { label: "Others (specify)", value: staff.partnerOthers, weight: 1 },
      { label: "Status of Referral", value: label("referralStatus", staff.referralStatus) || "Pending", weight: 1 },
    ]);
    this.paragraph("Remark(s)", staff.remarks);
    this.fieldRow([
      { label: "Interviewed / Profiled by", value: staff.interviewedBy },
      { label: "Position", value: staff.position },
      { label: "RPMO / Office", value: staff.office },
    ]);
    this.fieldRow([
      { label: "Date Profiled", value: staff.dateProfiled },
      { label: "Date Referred", value: staff.dateReferred },
      { label: "Agency Referred To", value: staff.agencyReferredTo },
    ]);
    this.fieldRow([
      { label: "Record Status", value: label("status", this.record.status), weight: 1 },
      { label: "Last Updated", value: fmtDate(this.record.updatedAt, true), weight: 2 },
    ]);

    this.hint(
      `Generated on ${fmtDate(new Date(), true)} from the KILOS Profiling System. This document contains confidential personal information and must be handled in accordance with the Data Privacy Act of 2012 (RA 10173).`
    );

    this.addFooter();
  }

  prioritySummary(o) {
    const map = {
      skills_training: "skillsTraining",
      employment: "employment",
      livelihood: "livelihood",
      education: "education",
      other: "other",
    };
    const priorities = o.priorities || {};
    return (o.assistanceInterests || [])
      .map((code) => {
        const rank = priorities[map[code]];
        return rank ? `${label("assistance", code)} (#${rank})` : label("assistance", code);
      })
      .join("; ");
  }
}

export function buildSubmissionPdf(record) {
  const doc = new PDFDocument({
    size: "A4",
    autoFirstPage: false,
    bufferPages: true,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: `KILOS Profiling - ${record.referenceNo || "Response"}`,
      Author: "DSWD Walang Gutom Program - KILOS Profiling System",
      Subject: "KILOS Beneficiary Profiling Form",
      Keywords: "KILOS, DSWD, Walang Gutom, profiling, beneficiary",
    },
  });

  const form = new KilosPdfForm(doc, record);
  form.render();
  return doc;
}
