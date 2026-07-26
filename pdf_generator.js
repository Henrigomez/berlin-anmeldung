const PDFDocument = require('pdfkit');

/**
 * Generates an official-looking Berlin Anmeldung PDF Document stream.
 * @param {Object} data - Form data provided by the user
 * @param {Stream} res - Express response stream
 */
function generateAnmeldungPDF(data, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40
  });

  // Set HTTP headers for inline PDF preview / download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Anmeldeformular_${data.lastName || 'Berlin'}.pdf`);

  doc.pipe(res);

  // Header Banner
  doc.rect(40, 40, 515, 60).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('ANMELDUNG BEI DER MELDEBEHÖRDE', 55, 52);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Landeshauptstadt Berlin • Senatsverwaltung für Inneres und Sport', 55, 75);

  doc.moveDown(2.5);
  doc.fillColor('#1e293b');

  // Subtitle / Note
  doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b')
     .text('Vorausgefülltes Meldeformular zur Vorlage beim Bürgeramt Berlin (gemäß § 17 Bundesmeldegesetz - BMG).', 40, 115);

  let y = 145;

  function drawSectionHeader(title) {
    doc.rect(40, y, 515, 20).fill('#e2e8f0');
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(title.toUpperCase(), 48, y + 5);
    y += 26;
  }

  function drawField(label, value, x, width, height = 28) {
    doc.rect(x, y, width, height).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
    doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), x + 6, y + 4);
    doc.fillColor('#0f172a').fontSize(9).font('Helvetica').text(value || '-', x + 6, y + 14, { width: width - 12, ellipsis: true });
  }

  // SECTION 1: Personal Data
  drawSectionHeader('1. Angaben zur Person (Personenstandsdaten)');
  
  drawField('Familienname / Surname', data.lastName, 40, 250);
  drawField('Geburtsname / Birth Name', data.birthName || data.lastName, 295, 260);
  y += 32;

  drawField('Vornamen / Given Names', data.firstName, 40, 350);
  drawField('Geschlecht / Gender', data.gender || 'keine Angabe', 395, 160);
  y += 32;

  drawField('Geburtsdatum / Date of Birth', data.dob, 40, 160);
  drawField('Geburtsort / Place of Birth', data.birthPlace, 205, 190);
  drawField('Staatsangehörigkeit / Nationality', data.nationality, 400, 155);
  y += 32;

  drawField('Familienstand / Civil Status', data.civilStatus || 'ledig', 40, 250);
  drawField('Religionszugehörigkeit / Religion', data.religion || 'keine', 295, 260);
  y += 40;

  // SECTION 2: New Residence in Berlin
  drawSectionHeader('2. Neue Wohnung in Berlin (Anmeldung)');

  drawField('Straße und Hausnummer / Street & Number', data.newStreet, 40, 370);
  drawField('Zusatz / Flat / Apt', data.newApt || '-', 415, 140);
  y += 32;

  drawField('Postleitzahl / Postal Code', data.newZip, 40, 120);
  drawField('Ort / City', 'Berlin', 165, 140);
  drawField('Bezirk / District', data.newDistrict || 'Berlin', 310, 245);
  y += 32;

  drawField('Einzugsdatum / Moving Date', data.moveDate, 40, 250);
  drawField('Wohnungsstatus / Residence Type', data.residenceType || 'Alleinige Wohnung', 295, 260);
  y += 40;

  // SECTION 3: Previous Residence
  drawSectionHeader('3. Bisherige Wohnung (Vormietverhältnis)');

  drawField('Bisherige Straße & Hausnr / Prev. Street', data.prevStreet, 40, 370);
  drawField('PLZ & Ort / Prev. Postal Code & City', `${data.prevZip || ''} ${data.prevCity || ''}`.trim(), 415, 140);
  y += 32;

  drawField('Staat / Country (falls Ausland)', data.prevCountry || 'Deutschland', 40, 250);
  drawField('Beibehaltung der bisherigen Wohnung?', data.keepPrevAddress === 'yes' ? 'Ja (Nebenwohnung)' : 'Nein (Aufgegeben)', 295, 260);
  y += 40;

  // SECTION 4: Landlord / Wohnungsgeber
  drawSectionHeader('4. Angaben zum Wohnungsgeber (Vermieter)');

  drawField('Name des Wohnungsgebers / Landlord Name', data.landlordName, 40, 350);
  drawField('Wohnungsgeberbestätigung liegt vor?', 'Ja (Erforderlich)', 395, 160);
  y += 45;

  // SECTION 5: Legal Declaration & Signatures
  doc.rect(40, y, 515, 90).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
  doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold').text('Rechtsverbindliche Erklärung / Declaration:', 48, y + 8);
  doc.fontSize(7.5).font('Helvetica').fillColor('#475569').text(
    'Ich bestätige die Richtigkeit aller vorstehenden Angaben. Mir ist bekannt, dass vorsätzlich oder fahrlässig falsche Angaben ordnungswidrig sind und mit einer Geldbuße geahndet werden können (§ 54 BMG).',
    48, y + 20, { width: 499 }
  );

  doc.text('Ort, Datum: Berlin, den ' + new Date().toLocaleDateString('de-DE'), 48, y + 60);
  doc.text('Unterschrift der meldepflichtigen Person: ___________________________', 280, y + 60);

  // Footer Branding
  doc.fontSize(7).fillColor('#94a3b8').text('Generiert über Wise-Bardeen Berlin Expat Bureaucracy Platform • https://berlin-anmeldung-bot.com', 40, 780, { align: 'center' });

  doc.end();
}

module.exports = { generateAnmeldungPDF };
