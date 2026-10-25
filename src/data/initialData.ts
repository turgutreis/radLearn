import type { StudyDeck, Question, MatchingPair, StudyFolder } from '../types'

export const DEFAULT_FOLDERS: StudyFolder[] = [
  {
    id: 'strahlenschutz',
    name: 'Strahlenschutz, Recht & Dosimetrie',
    icon: 'Shield',
    color: 'amber',
    description: 'StrlSchG, StrlSchV, Grenzwerte, Personendosimetrie & Fristen',
    isBuiltIn: true
  },
  {
    id: 'nuklearmedizin',
    name: 'Nuklearmedizin & Radiopharmaka',
    icon: 'Atom',
    color: 'purple',
    description: 'Radiotracer, Szintigrafie, SPECT, PET & Theranostik',
    isBuiltIn: true
  },
  {
    id: 'roentgendiagnostik',
    name: 'Röntgendiagnostik & Einstelltechnik',
    icon: 'Bone',
    color: 'cyan',
    description: 'Skelett, Thorax, Abdomen, Belichtung & Bildkriterien',
    isBuiltIn: true
  },
  {
    id: 'strahlentherapie',
    name: 'Strahlentherapie & Radioonkologie',
    icon: 'Crosshair',
    color: 'rose',
    description: 'Linearbeschleuniger, Bestrahlungsplanung & Brachytherapie',
    isBuiltIn: true
  },
  {
    id: 'anatomie',
    name: 'Anatomie & Physiologie',
    icon: 'Activity',
    color: 'emerald',
    description: 'Skelettsystem, Organe & Schnittbildanatomie',
    isBuiltIn: true
  },
  {
    id: 'custom',
    name: 'Eigene Skripte & Uploads',
    icon: 'Folder',
    color: 'blue',
    description: 'Individuelle Vorlesungsmitschriften, Buchseiten & Übungssets',
    isBuiltIn: true
  }
]

export const INITIAL_DECKS: StudyDeck[] = [
  {
    id: 'deck-gesetze',
    folderId: 'strahlenschutz',
    title: '1. Gesetze, Behörden & Grundsätze',
    description: 'EURATOM, Atomgesetz, StrlSchG (218 §§), StrlSchV (200 §§), MTBG, Regierungspräsidien Ba-Wü & ALARA.',
    icon: 'Scale',
    color: 'amber',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'EURATOM (1957): Europäische Ebene, Grundnormen, Förderung der Kernenergie, eigenständig aber eng mit EU verbunden.',
      'Atomgesetz (AtG, 1959): Nationale Ebene; seit 2017 Fokus auf geordnetem Ausstieg aus der Kernenergie (letzte 3 AKWs am 15.04.2023 abgeschaltet; GKN Neckarwestheim Block I: 1976–2011, Block II: 1989–2023, Zwischenlager bis 2046).',
      'StrlSchG (01.01.2019): 218 Paragraphen in 8 Teilen zzgl. 9 Anlagen. Wird konkretisiert durch StrlSchV (29.11.2018 / 01.01.2019, 200 Paragraphen in 6 Teilen zzgl. 19 Anlagen).',
      '3 Rechtsverbindliche Grundsätze im StrlSchG: 1. Rechtfertigung (Nutzen > Risiko, Bild muss befundbar sein!), 2. Dosisbegrenzung (Grenzwerte einhalten), 3. Optimierung (ALARA-Prinzip).',
      '3 A im Strahlenschutz: Abstand, Aufenthaltsdauer, Abschirmung (4 A in NUK: + Aktivitätsmengenbegrenzung; 5 A: + Abfallmenge begrenzen).',
      '4 Regierungsbezirke in Ba-Wü: Karlsruhe (Baden – zuständig für Heidelberg!), Freiburg, Tübingen (Württemberg), Stuttgart (Württemberg).',
      'MTBG § 5: Vorbehaltene Tätigkeiten für MTR (Radiologische Diagnostik, Strahlentherapie, Nuklearmedizin, Dosimetrie & Strahlenschutz).'
    ]
  },
  {
    id: 'deck-dosis',
    folderId: 'strahlenschutz',
    title: '2. Physikalische & Biologische Dosisgrößen',
    description: 'Gray vs. Sievert, Energiedosis, Äquivalentdosis, Effektive Dosis, wR & wT, LET, RBW, DFP und Halbwertszeiten.',
    icon: 'Atom',
    color: 'cyan',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'Energiedosis D = E / m [J/kg = Gray (Gy)]: Rein physikalischer Messwert (deponierte Energie pro Masse).',
      'Äquivalentdosis H = D · wR [J/kg = Sievert (Sv)]: Berücksichtigt Strahlungsart & Energie über Strahlenwichtungsfaktor wR (Photonen/Elektronen = 1, Neutronen = 5–20, Alpha = 20).',
      'Effektive Dosis E = Σ (HT · wT) [Sv]: Rechenwert! Berücksichtigt unterschiedliche Strahlenempfindlichkeit der Organe über Gewebewichtungsfaktor wT.',
      'Gewebewichtungsfaktoren wT (aufsteigend): Knochen/Haut = 0,01 → Niere, Leber, Schilddrüse (SD) = 0,05 → Lunge, rotes Knochenmark (KM), Magen-Darm = 0,12 → Keimdrüsen (Gonaden) = 0,20.',
      'Halbwertszeiten: 1/Teff = 1/Tphys + 1/Tbio bzw. Teff = (Tphys · Tbio) / (Tphys + Tbio). Die effektive HWZ ist immer kleiner als die kleinere der beiden Einzel-HWZ! (Cs-137 Tphys ≈ 30 Jahre).',
      'DFP (Dosisflächenprodukt, [cGy·cm² = µGy·m²]): Messwert am Strahlenaustrittsfenster. Abstandsunabhängig, da Fläche quadratisch zunimmt und Dosis quadratisch abnimmt (Abstandsquadratgesetz).',
      'LET (Linearer Energietransfer, keV/µm): Energieverlust ΔE pro Wegstrecke Δs. Hoch-LET = Alpha, schnelle Neutronen (dicht ionisierend); Niedrig-LET = Photonen, Elektronen (locker ionisierend).',
      'RBW (Relative Biologische Wirksamkeit): RBW = Dx (Referenzstrahlung) / Di (Teststrahlung) für gleichen biologischen Effekt (z.B. 35 DSB: Rö = 1 Gy, Alpha = 0,5 Gy → RBW = 2).'
    ]
  },
  {
    id: 'deck-dosimetrie',
    folderId: 'strahlenschutz',
    title: '3. Personendosimetrie, Messgrößen & DRW',
    description: 'OSL-/Filmdosimeter, Hp(10), Hp(3), Hp(0,07), Ortsdosis H*(10), ODL, Schwangere & Diagnostische Referenzwerte (§ 125).',
    icon: 'Gauge',
    color: 'emerald',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'Amtliches Personendosimeter (z.B. OSL oder Film): Vorderseite des Rumpfes tragen, monatlicher Wechsel, individuelle SSR-Nummer (Strahlenschutzregisternummer), Meldung über SSV ans BfS.',
      'Tiefen-Personendosis Hp(10): Äquivalentdosis in 10 mm Tiefe (Ganzkörperdosimeter → Schätzwert für effektive Dosis).',
      'Augenlinsen-Personendosis Hp(3): Äquivalentdosis in 3 mm Tiefe.',
      'Oberflächen-Personendosis Hp(0,07): Äquivalentdosis in 0,07 mm Tiefe in der Haut (z.B. Ringdosimeter an der Hand mit Detektorfläche nach innen!).',
      'Schwangere: Zusätzlich zum Rumpfdosimeter ein direkt ablesbares Dosimeter auf Höhe des Uterus (sichtbar, nichts drüber hängen wegen Schwächung), 1x pro Woche selbst auslesen.',
      'Ortsdosis H*(10) [Sv] & Ortsdosisleistung ODL [mSv/h oder µSv/h]: Absperrgrenze beim Einsatz = 25 µSv/h. Bundesweites Gamma-ODL-Messnetz des BfS (~1800 Messstellen, 10-Min-Takt, 1 m über Grasboden, Durchschnitt ca. 0,084 µSv/h).',
      '§ 125 Diagnostische Referenzwerte (DRW): Vergleichswerte für Standarduntersuchungen (KEINE Grenzwerte, dürfen z.B. bei adipösen Patienten mit Begründung überschritten werden). Vom BfS erstellt (Prüfung spätestens alle 3 Jahre), Ärztliche Stelle sammelt Daten alle 2 Jahre.'
    ]
  },
  {
    id: 'deck-grenzwerte',
    folderId: 'strahlenschutz',
    title: '4. Grenzwerte, Kategorien & Schutzbereiche',
    description: 'Kat. A & B, Berufslebensdosis (400 mSv), Überwachungs-, Kontroll- & Sperrbereich, Schwangere & Rechenaufgaben.',
    icon: 'ShieldAlert',
    color: 'rose',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'Einzelperson der Bevölkerung / Allgemeines Staatsgebiet (§ 80): Deff ≤ 1 mSv/a, ODL ≤ 0,5 µSv/h, Augenlinse 15 mSv/a, lokale Haut 50 mSv/a.',
      'Überwachungsbereich: Deff > 1 bis ≤ 6 mSv/a (ODL > 0,5 bis ≤ 3 µSv/h), Organ-Äquivalentdosis Haut/Extremitäten > 50 mSv/a, Augenlinse > 15 mSv/a. Beispiel: Schaltraum / Schaltpult.',
      'Kontrollbereich: Deff > 6 bis 20 mSv/a (ODL > 3 µSv/h bis ≤ 3 mSv/h), Augenlinse > 15 mSv/a, Haut/Extremitäten > 150 mSv/a. Kennzeichnungspflicht! (Permanent: Heißlabor NUK; Temporär: Röntgenraum während Einschaltzeit, LB-Raum kurz nach Abschalten).',
      'Sperrbereich (Teil des Kontrollbereichs): ODL > 3 mSv/h („Sperrbereich – kein Zutritt“, z.B. LB-Raum während Bestrahlung).',
      'Beruflich Exponierte ≥ 18 J. (§ 78): Deff max. 20 mSv/a (Einzelfall 50 mSv/a, aber max. 100 mSv in 5 Jahren), Augenlinse 20 mSv/a, Haut/Extremitäten 500 mSv/a.',
      'Kat. A (> 6 bis 20 mSv/a): Jährliche ärztliche Untersuchung Pflicht! Kat. B (> 1 bis 6 mSv/a, „wir“): Untersuchung vor Aufnahme, danach optional (am UKHD alle 3 Jahre).',
      'Unter 18 Jahren (Azubis): Deff max. 1 mSv/a, Augenlinse 15 mSv/a, Haut/Extremitäten 50 mSv/a.',
      'Gebärfähige Frauen & Schwangere: Gebärmutter (Uterus) max. 2 mSv/Monat; Ungeborenes Kind max. 1 mSv ab Mitteilung der SS bis Ende. Ab > 100 mSv Embryonaldosis → Interruptio-Indikation (4. Woche: 50–100 mSv Herz/Nerven; 10. Woche: 300 mSv Gehirnfehlentwicklung).',
      'Berufslebensdosis (§ 77): 400 mSv. Bei Überschreitung mit schriftlicher Zustimmung (Behörde, Arzt, Person, AG, SSB) für 5 weitere Jahre max. 10 mSv/a (danach endgültig Schluss).'
    ]
  },
  {
    id: 'deck-organisation',
    folderId: 'strahlenschutz',
    title: '5. Betriebliche Organisation, Inbetriebnahme & Recht',
    description: 'SSV, SSBV, SSB, MPE, Fachkunde vs. Kenntnisse, Teleradiologie, Genehmigungs- vs. Anzeigeverfahren & Prüfungen.',
    icon: 'Building2',
    color: 'violet',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'SSV (Strahlenschutzverantwortlicher, z.B. Prof. Debus / Prof. Autenrieth): Rechtlich verantwortlich, kann juristische Person sein, braucht KEINE Fachkunde/Kenntnisse, aber Führungszeugnis (alle 5 J.). Delegiert Aufgaben, bleibt aber rechtlich in der Pflicht.',
      'SSBV (Strahlenschutzbevollmächtigter, z.B. Hr. Knoch, Fr. Soiné): Vertreter des SSV in größeren Betrieben, benötigt Fachkunde.',
      'SSB (Strahlenschutzbeauftragter, ca. 110–120 am UKHD): Vom SSV schriftlich bestellt & Behörde gemeldet. Braucht Fachkunde + Führungszeugnis. Erhöhter Kündigungsschutz (bis 1 Jahr nach Niederlegung), Benachteiligungsverbot, muss bei Vorkommnis innerhalb von 15 Minuten vor Ort sein!',
      'MPE (Medizinphysik-Experte, z.B. Hr. Ötzel): Master in Med. Physik + Fachkunde. Darf Strahlung zu Prüfzwecken auslösen, aber NICHT am Menschen anwenden!',
      'Fachkunde (prakt. Nachweise ~1600–2000h + Kurs) vs. Kenntnisse (90h Kurs mit Prüfung, z.B. MFA unter ständiger Aufsicht, Ärzte vor Ort bei Teleradiologie). Beide müssen alle 5 Jahre aktualisiert werden!',
      'Anzeigeverfahren (§ 19 StrlSchG): Nur in der Diagnostik bei neuen Geräten MIT CE-Zeichen, Bauartzulassung, erfolgter Hersteller-Abnahmeprüfung und SV-Bescheinigung. Frist: 4 Wochen vor Inbetriebnahme (bzw. 2 Wochen nach Tabelle Skript 1) anzeigen.',
      'Genehmigungsverfahren (§ 12 StrlSchG): Immer bei Strahlentherapie (Anlagen zur Behandlung), Teleradiologie, Früherkennung (Screening), Altgeräten ohne CE, mobilen Röntgenräumen oder wenn SV-Bescheinigung fehlt.',
      'Prüfungen: 1. Abnahmeprüfung (Hersteller/Lieferant vor Betrieb, legt Referenzwerte fest), 2. Konstanzprüfung (monatlich durch MTR, Vergleich mit Bezugswerten), 3. Sachverständigenprüfung (alle 5 Jahre durch behördlich bestimmten SV).'
    ]
  },
  {
    id: 'deck-freigabe-fristen',
    folderId: 'strahlenschutz',
    title: '6. Freigabe, Kontamination, Radon & Alle Fristen',
    description: 'Freigabeverfahren (10 µSv/a, 10 HWZ), Vorkommnis vs. Notfall vs. Störfall, Radon (300 Bq/m³), Natürliche Strahler & Aufbewahrungsfristen.',
    icon: 'Clock',
    color: 'blue',
    sourceFileName: 'Strahlenschutz_Skript_1_und_2.pdf',
    createdAt: '2026-10-20',
    isBuiltIn: true,
    summaryPoints: [
      'Expositionssituationen (§ 2 StrlSchG): 1. Geplante (Medizin, alles unter Kontrolle), 2. Notfall (unberechenbar, z.B. AKW-Havarie Tschernobyl), 3. Bestehende (nach Notfall evakuierte Gebiete, Radon).',
      'Vorkommnis: Unbeabsichtigte Exposition in einer geplanten Situation (z.B. 2x Röntgen ausgelöst). Unverzügliche Meldung an Behörde (bei bedeutsamem Vorkommnis ans BfS / radiologisches Lagezentrum), 30 Jahre Aufbewahrungsfrist!',
      'Freigabe: Entlassung radioaktiver Stoffe aus dem Strahlenschutzrecht. Dosiskriterium: max. 10 µSv/a für Einzelperson der Bevölkerung. Mind. 10 HWZ abklingen lassen (Freimessung unter Berücksichtigung des doppelten Nulleffekts). Uneingeschränkte Freigabe im KH für Isotope mit HWZ < 100 Tage. Vermischungsverbot!',
      'Gebindebeschriftung: Leitnuklid (längste HWZ), Datum, Volumen, gemessene Aktivität. Vor Entsorgung nochmals unter gleichen Bedingungen messen.',
      'Ableitung: Abgabe flüssiger/gasförmiger Stoffe auf vorgesehenen Wegen → Grenzwert Bevölkerung: 0,3 mSv/Kalenderjahr.',
      'Radon-222 (§§ 124–132): Referenzwert in Aufenthaltsräumen & Arbeitsplätzen (EG/Keller) = 300 Bq/m³. Messung innerhalb von 18 Monaten, Aufzeichnungen 5 Jahre archivieren. Ab > 6 mSv/a greift beruflicher Strahlenschutz.',
      'Nuklidkarte Farben: Alpha-Strahler = GELB (Rn-222, Po-210 in Tabak; 4He-Kern, A-4, Z-2), Beta-Minus = BLAU (C-14, H-3, Pb-210; n → p + e⁻ + Anti-ν, Z+1, A gleich), Beta-Plus = ROT (p → n + e⁺ + ν, Z-1, A gleich).',
      'Wichtige Aufbewahrungsfristen: 1 Jahr (Unterweisung Begleitpersonen), 5 Jahre (Personal-Unterweisung, Bildgebung, Messtechn. Überwachung, Radon, Dosis SS), 10 Jahre (OSL-Personendosis durch SSV, Konstanzprüfung, Messgeräte-Wartung, Kontaminationsüberschreitung, Untersuchungsdaten Volljähriger), 30 Jahre (Behandlung/Therapie, Vorkommnis, Bestand HWZ>100d), 75. LJ / mind. 30 J. / max. 100 J. (Summe berufl. Exposition).'
    ]
  },
  {
    id: 'deck-nuk-prinzipien',
    folderId: 'nuklearmedizin',
    title: '1. Prinzipien der Nuklearmedizin & Radiotracer',
    description: 'Einführung nach Neumaier: Radiotracer (Substrat + Radionuklid), Szintigrafie, SPECT, PET, Funktionsdiagnostik vs. Radiologie & Theranostik.',
    icon: 'Atom',
    color: 'purple',
    sourceFileName: 'Neumaier_Prinzipien_der_Nuklearmedizin_S20.jpg',
    createdAt: '2026-10-25',
    isBuiltIn: true,
    summaryPoints: [
      'Nuklearmedizin vs. Radiologie: Radiologie bildet Anatomie/Morphologie durch gewebespezifische Absorption externer Röntgenstrahlung ab. Nuklearmedizin visualisiert und quantifiziert Stoffwechsel & physiologische Prozesse von innen nach außen mittels verabreichten Radiopharmaka.',
      'Radiotracer-Aufbau: Biologisch selektiver Ligand/Substrat (bindet hochaffin an Zielstruktur wie Tumor oder Rezeptor) + Radionuklid (Strahlenquelle zur externen Messung oder gezielten Zerstörung).',
      'Detektionsverfahren: Planare Szintigrafie (Gammakamera 2D), SPECT (rotierende Kameraköpfe für 3D-Einzelphotonen-Schnittbilder) und PET (geschlossener Detektorring für Positronen-Koinzidenzmessung).',
      'Theranostik: Kombination aus Diagnostik & zielgerichteter Therapie – exakt derselbe Ligand wird mit Diagnostik- oder Therapienukliden markiert (z.B. PSMA bei Prostatakarzinomen).',
      'Strahlenschutz: Höchste Relevanz, da mit offenen Radionukliden hantiert wird (Kontaminations- und Inkorporationsschutz im Heißlabor).'
    ]
  }
]

export const INITIAL_QUESTIONS: Question[] = [
  // ================= DECK 1: GESETZE, BEHÖRDEN & GRUNDSÄTZE =================
  {
    id: 'q-ges-1',
    deckId: 'deck-gesetze',
    question: 'Welche Aussage beschreibt das Verhältnis zwischen EURATOM, Atomgesetz (AtG), StrlSchG und StrlSchV korrekt?',
    options: [
      'EURATOM bildet auf europäischer Ebene die Grundnormen (seit 1957); in Deutschland regelt seit 01.01.2019 das StrlSchG den Strahlenschutz und wird durch die StrlSchV konkretisiert.',
      'Das Atomgesetz hat 2019 das StrlSchG vollständig abgelöst und gilt nur noch für Röntgendiagnostik.',
      'Die StrlSchV steht rechtlich über dem EURATOM-Vertrag und dem Grundgesetz.',
      'EURATOM gilt ausschließlich für Großbritannien und die Schweiz.'
    ],
    correctIndex: 0,
    explanation: 'Auf europäischer Ebene gibt EURATOM (1957) die Grundnormen vor. Auf nationaler Ebene wurden die Regelungen zum Schutz vor ionisierender Strahlung zum 01.01.2019 im Strahlenschutzgesetz (StrlSchG, 218 §§) neu zusammengefasst und durch die Strahlenschutzverordnung (StrlSchV, 200 §§) konkretisiert.',
    mnemonic: 'Hierarchie: EURATOM (EU) → AtG & StrlSchG (Gesetz) → StrlSchV (Verordnung) → Richtlinien/DIN.',
    lawReference: 'StrlSchG / StrlSchV (01.01.2019)',
    pdfSource: 'PDF 1, S. 1 & PDF 2, S. 2–3',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie gliedert sich die Hierarchie im Strahlenschutzrecht (EU bis Deutschland) seit 2019?',
    flashcardBack: '1. EURATOM (EU-Grundnormen, 1957)\n2. Atomgesetz (AtG, 1959, Kernenergie-Ausstieg) & StrlSchG (01.01.2019, 218 §§ in 8 Teilen)\n3. StrlSchV (200 §§ in 6 Teilen, konkretisiert das StrlSchG)\n4. Untergesetzliche Regelwerke (Richtlinien, DIN-Normen)'
  },
  {
    id: 'q-ges-2',
    deckId: 'deck-gesetze',
    question: 'Wie heißen die 4 Regierungsbezirke in Baden-Württemberg und welches Regierungspräsidium (RP) ist für Heidelberg (z. B. UKHD) zuständig?',
    options: [
      'Karlsruhe, Freiburg, Tübingen, Stuttgart – zuständig für Heidelberg ist das RP Karlsruhe.',
      'Heidelberg, Mannheim, Stuttgart, Ulm – zuständig ist das RP Heidelberg.',
      'Karlsruhe, Mannheim, Freiburg, Konstanz – zuständig ist das RP Stuttgart.',
      'Tübingen, Reutlingen, Baden-Baden, Stuttgart – zuständig ist das BfS Berlin.'
    ],
    correctIndex: 0,
    explanation: 'Baden-Württemberg ist in die 4 Regierungsbezirke Karlsruhe (Baden), Freiburg, Tübingen (Württemberg) und Stuttgart (Württemberg) unterteilt. Jedes RP ist für den Vollzug von StrlSchG und StrlSchV in seinem Bezirk zuständig; für Heidelberg ist dies das Regierungspräsidium Karlsruhe.',
    mnemonic: 'Ka-Frei-Tü-Stu (Karlsruhe, Freiburg, Tübingen, Stuttgart) → Heidelberg liegt im Bezirk Karlsruhe!',
    lawReference: 'Landesrecht Ba-Wü / § 184 StrlSchG',
    pdfSource: 'PDF 1, S. 6 & PDF 2, S. 26',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Nenne die 4 Regierungsbezirke in Ba-Wü und wer für Heidelberg zuständig ist!',
    flashcardBack: '• Karlsruhe (Baden) → zuständig für Heidelberg!\n• Freiburg\n• Tübingen (Württemberg)\n• Stuttgart (Württemberg)'
  },
  {
    id: 'q-ges-3',
    deckId: 'deck-gesetze',
    question: 'Wann ist eine „rechtfertigende Indikation“ in der Röntgendiagnostik laut Unterrichtsskript gerechtfertigt?',
    options: [
      'Wenn das erzeugte Bild befundbar ist und der gesundheitliche Nutzen das Strahlenrisiko überwiegt.',
      'Immer dann, wenn der Patient ausdrücklich ein Röntgenbild wünscht.',
      'Sobald ein Gerät ein gültiges CE-Zeichen besitzt, unabhängig von der Fragestellung.',
      'Nur bei therapeutischen Bestrahlungen, nicht jedoch in der Diagnostik.'
    ],
    correctIndex: 0,
    explanation: 'Merksatz aus beiden Skripten: „Wann ist eine rechtfertigende Indikation gerechtfertigt? – Wenn das Bild befundbar ist!“ Zudem muss nach § 83 StrlSchG ein Arzt mit Fachkunde prüfen, dass der gesundheitliche Nutzen das Strahlenrisiko überwiegt.',
    mnemonic: 'Kein befundbares Bild = Körperverletzung / keine Rechtfertigung!',
    lawReference: '§ 83 StrlSchG',
    pdfSource: 'PDF 1, S. 11 & PDF 2, S. 15, 25',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wann ist eine rechtfertigende Indikation gerechtfertigt? (Kurzer Prüfungs-Merksatz + § 83)',
    flashcardBack: '• Prüfungs-Merksatz: „Wenn das Bild befundbar ist!“\n• Nach § 83 StrlSchG: Muss von einem Arzt mit Fachkunde gestellt werden; gesundheitlicher Nutzen muss das Risiko überwiegen.'
  },
  {
    id: 'q-ges-4',
    deckId: 'deck-gesetze',
    question: 'Welche 3 Grundsätze sind im Strahlenschutzgesetz rechtsverbindlich festgelegt?',
    options: [
      'Rechtfertigung, Dosisbegrenzung, Optimierung (ALARA)',
      'Abstand, Abschirmung, Aufenthaltsdauer',
      'Genehmigung, Anzeige, Freigabe',
      'Messung, Dokumentation, Archivierung'
    ],
    correctIndex: 0,
    explanation: 'Die 3 Grundsätze des Strahlenschutzes sind: 1. Rechtfertigung (Nutzen > Schaden), 2. Dosisbegrenzung (Grenzwerte nicht überschreiten) und 3. Optimierung (ALARA: As Low As Reasonably Achievable – jede unnötige Exposition vermeiden). (Hinweis: Abstand, Aufenthaltsdauer, Abschirmung sind die 3 A-Regeln zur praktischen Umsetzung).',
    mnemonic: 'R-D-O: Rechtfertigung, Dosisbegrenzung, Optimierung (ALARA).',
    lawReference: '§§ 6–8 StrlSchG',
    pdfSource: 'PDF 2, S. 26',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche 3 Grundsätze sind im Strahlenschutzgesetz rechtsverbindlich festgelegt?',
    flashcardBack: '1. Rechtfertigung (Nutzen überwiegt Schaden)\n2. Dosisbegrenzung (Einhaltung der Grenzwerte)\n3. Optimierung (ALARA-Prinzip: so niedrig wie vernünftigerweise erreichbar)'
  },
  {
    id: 'q-ges-5',
    deckId: 'deck-gesetze',
    question: 'Was bedeuten die „3 A“, „4 A“ und „5 A“ im Strahlenschutz bzw. in der Nuklearmedizin?',
    options: [
      '3 A: Abstand, Aufenthaltsdauer, Abschirmung | 4 A (NUK): + Aktivitätsmengenbegrenzung | 5 A (NUK): + Abfallmenge begrenzen',
      '3 A: Anzeige, Abnahme, Aufbewahrung | 4 A: + Aufsicht | 5 A: + Archivierung',
      '3 A: Alpha, Atom, Aktivität | 4 A: + Äquivalentdosis | 5 A: + Ableitung',
      '3 A: Arzt, Assistent, Aufklärung | 4 A: + Anamnese | 5 A: + Anordnung'
    ],
    correctIndex: 0,
    explanation: 'Im allgemeinen Strahlenschutz gelten die 3 A: Abstand halten, Aufenthaltsdauer minimieren, Abschirmung nutzen. In der Nuklearmedizin kommen als 4. A die Aktivitätsmengenbegrenzung und als 5. A die Begrenzung der Abfallmenge hinzu.',
    mnemonic: '3A = Basis (Abstand, Aufenthalt, Abschirmung) + Aktivität (4A) + Abfall (5A) in der NUK.',
    lawReference: 'ALARA / Praktischer Strahlenschutz',
    pdfSource: 'PDF 1, S. 4 & PDF 2, S. 2',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wofür stehen die 3 A im Strahlenschutz und die 4 A bzw. 5 A in der Nuklearmedizin?',
    flashcardBack: '• 3 A: Abstand, Aufenthaltsdauer, Abschirmung\n• 4 A (NUK): + Aktivitätsmengenbegrenzung\n• 5 A (NUK): + Abfallmenge begrenzen'
  },
  {
    id: 'q-ges-6',
    deckId: 'deck-gesetze',
    question: 'Für welche Strahlenexpositionen gilt das Strahlenschutzgesetz (StrlSchG) laut § 1 NICHT?',
    options: [
      'Für natürlich vorkommende Strahlenexpositionen (z. B. allgemeine kosmische und terrestrische Strahlung), sofern sie nicht beruflich oder durch Radon-Regelungen erfasst sind.',
      'Für geplante Expositionssituationen in der Medizin.',
      'Für Notfallexpositionssituationen und bestehende Expositionssituationen.',
      'Für den Betrieb von Störstrahlern und Röntgeneinrichtungen.'
    ],
    correctIndex: 0,
    explanation: 'Nach § 1 StrlSchG gilt das Gesetz für geplante, Notfall- und bestehende Expositionssituationen, jedoch NICHT für die allgemeine natürlich vorkommende Strahlenexposition (wie normale kosmische oder terrestrische Umgebungsstrahlung).',
    mnemonic: 'Normale Naturstrahlung lässt sich gesetzlich nicht verbieten!',
    lawReference: '§ 1 StrlSchG',
    pdfSource: 'PDF 2, S. 3',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Für welche 3 Expositionssituationen gilt das StrlSchG (§ 1) und wofür gilt es NICHT?',
    flashcardBack: 'Gilt für:\n1. Geplante Expositionssituationen\n2. Notfallexpositionssituationen\n3. Bestehende Expositionssituationen\n\nGilt NICHT für: allgemeine natürlich vorkommende Strahlenexpositionen (kosmisch/terrestrisch).'
  },
  {
    id: 'q-ges-7',
    deckId: 'deck-gesetze',
    question: 'Welche Aussage zum Kernkraftwerk Neckarwestheim (GKN) und dem deutschen Atomausstieg trifft laut Skript zu?',
    options: [
      'Die letzten 3 deutschen AKWs wurden am 15.04.2023 abgeschaltet; GKN hatte zwei Druckwasserreaktoren (Block I: 1976–2011, Block II: 1989–2023) und eine Zwischenlager-Genehmigung bis 2046.',
      'GKN II ist ein Siedewasserreaktor, der noch bis 2035 Strom produziert.',
      'Der Atomausstieg wurde erst 2023 beschlossen und alle Brennstäbe wurden bereits nach Finnland gebracht.',
      'In Baden-Württemberg gab es nie ein Kernkraftwerk.'
    ],
    correctIndex: 0,
    explanation: 'Der Atomausstieg wurde 2011 nach Fukushima beschlossen, die letzten drei Kraftwerke schalteten am 15.04.2023 ab. Neckarwestheim (GKN) bestand aus zwei Druckwasserreaktoren (Block I 1976–2011, Block II 1989–2023, 1.400 MW, insgesamt > 576 Mrd. kWh). Die Genehmigung des Zwischenlagers läuft bis 2046, Notstromaggregate reichen für 48h.',
    mnemonic: '15.04.2023 AKW-Aus; GKN = 2 Druckwasserreaktoren, Zwischenlager bis 2046, 48h Diesel-Notstrom.',
    lawReference: 'Atomgesetz (AtG)',
    pdfSource: 'PDF 1, S. 1 & PDF 2, S. 4, 28',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Eckdaten zum Atomausstieg & AKW Neckarwestheim (GKN) aus dem Skript?',
    flashcardBack: '• Beschluss Atomausstieg: 2002 / nach Fukushima 30.06.2011\n• Abschaltung letzte 3 AKWs: 15.04.2023\n• GKN: 2 Druckwasserreaktoren (Block I: 1976–2011, Block II: 1989–2023, 1400 MW)\n• Zwischenlager-Genehmigung GKN: bis 2046 (48h Diesel-Notstrom)'
  },
  {
    id: 'q-ges-8',
    deckId: 'deck-gesetze',
    question: 'Welche Tätigkeiten sind nach § 5 MTBG „vorbehaltene Tätigkeiten“ für Medizinische Technologinnen und Technologen für Radiologie (MTR)?',
    options: [
      'Technische Durchführung & Qualitätssicherung in Röntgendiagnostik, Strahlentherapie und Nuklearmedizin, Verabreichung von (Radio-)Pharmaka nach ärztlicher Anordnung sowie Dosimetrie/Strahlenschutz.',
      'Eigenständiges Stellen der rechtfertigenden Indikation ohne Arzt und Verschreiben von Medikamenten.',
      'Durchführung der 5-jährlichen Sachverständigenprüfung anstelle des behördlichen Sachverständigen.',
      'Genehmigung von neuen Röntgenanlagen im Namen des Regierungspräsidiums.'
    ],
    correctIndex: 0,
    explanation: 'Nach § 5 Abs. 2 MTBG sind den MTR vorbehalten: 1. Techn. Durchführung & Beurteilung der Ergebnisqualität in der radiologischen Diagnostik inkl. QS & Pharmakagabe nach ärztl. Anordnung, 2. Strahlentherapie & Mitwirkung am Bestrahlungsplan, 3. Nuklearmedizin inkl. Radiopharmaka nach ärztl. Anordnung, 4. Physikalisch-technische Aufgaben in Dosimetrie und Strahlenschutz.',
    mnemonic: 'MTBG § 5 = 4 Säulen der MTR: Diagnostik, Therapie, NUK, Dosimetrie/StrlSch.',
    lawReference: '§ 5 Abs. 2 MTBG',
    pdfSource: 'PDF 2, S. 26–27',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Was regelt § 5 MTBG (Vorbehaltene Tätigkeiten für MTR)?',
    flashcardBack: 'Nur MTR dürfen ausüben:\n1. Techn. Durchführung & QS radiologische Diagnostik (+ Pharmaka n. ärztl. Anordnung)\n2. Techn. Durchführung Strahlentherapie (+ Mitwirkung Bestrahlungsplan)\n3. Techn. Durchführung NUK (+ Radiopharmaka n. ärztl. Anordnung)\n4. Physikalisch-technische Aufgaben in Dosimetrie & Strahlenschutz'
  },

  // ================= DECK 2: PHYSIKALISCHE & BIOLOGISCHE DOSISGRÖSSEN =================
  {
    id: 'q-dos-1',
    deckId: 'deck-dosis',
    question: 'Worin besteht der grundlegende Unterschied zwischen den Einheiten Gray (Gy) und Sievert (Sv)?',
    options: [
      'Gray (Gy = J/kg) ist ein rein physikalischer Messwert für die absorbierte Energiedosis (D = E/m); Sievert (Sv) ist ein Rechenwert im Strahlenschutz, der die biologische Wirkung über Wichtungsfaktoren bewertet.',
      'Sievert wird direkt mit der Ionisationskammer als physikalische Wärmemenge gemessen, während Gray die genetische Strahlenwirkung beschreibt.',
      '1 Gray entspricht immer genau 20 Sievert, unabhängig von der Strahlenart.',
      'Gray gilt nur für radioaktive Gase (Radon), Sievert nur für Röntgenstrahlung.'
    ],
    correctIndex: 0,
    explanation: 'Gray (Gy = J/kg) beschreibt als physikalischer Messwert die Energiedosis D = E/m (deponierte Energie pro Masse). Sobald die biologische Wirkung auf Gewebe bewertet wird (Äquivalentdosis H = D · wR bzw. Effektive Dosis E = Σ HT · wT), nutzt man den Rechenwert Sievert (Sv).',
    mnemonic: 'Gray = Greifbar (physikalisch messbar); Sievert = Schutz (biologisch gewichteter Rechenwert).',
    lawReference: 'StrlSchV Teil 1 / § 5 StrlSchG',
    pdfSource: 'PDF 1, S. 1 & PDF 2, S. 5, 25',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Unterschied zwischen Gray (Gy) und Sievert (Sv)? Ist die effektive Dosis ein Mess- oder Rechenwert?',
    flashcardBack: '• Gray [Gy = J/kg]: Rein physikalischer Messwert (Energiedosis D = E/m, absorbierte Energie pro Masse).\n• Sievert [Sv = J/kg]: Biologisch gewichteter Rechenwert im Strahlenschutz (Äquivalentdosis H = D·wR und Effektive Dosis E = Σ HT·wT).\n• Effektive Dosis = Rechenwert!'
  },
  {
    id: 'q-dos-2',
    deckId: 'deck-dosis',
    question: 'Wie sind die Gewebewichtungsfaktoren (wT) der folgenden Organe in ZUNEHMENDER Strahlenempfindlichkeit (von unempfindlich nach sehr empfindlich) korrekt sortiert?',
    options: [
      'Knochen (0,01) < Schilddrüse, Leber, Nieren (0,05) < Lunge, rotes Knochenmark (0,12) < Keimdrüsen (0,20)',
      'Keimdrüsen (0,01) < Lunge (0,05) < Leber, Niere (0,12) < Knochen (0,20)',
      'Nieren (0,01) < Knochen (0,05) < Schilddrüse (0,12) < Lunge (0,20)',
      'Knochen (0,05) < Lunge (0,10) < Schilddrüse (0,15) < Leber (0,25)'
    ],
    correctIndex: 0,
    explanation: 'Je höher der Gewebewichtungsfaktor wT, desto strahlenempfindlicher ist das Gewebe: Knochen/Haut = 0,01 → Leber, Nieren, Schilddrüse (SD) = 0,05 → Lunge, rotes Knochenmark (KM), Magen-Darm = 0,12 → Keimdrüsen (Gonaden) = 0,20.',
    mnemonic: '1 Cent (0,01) Knochen → 5 Cent (0,05) Niere/Leber/SD → 12 Cent (0,12) Lunge/KM → 20 Cent (0,20) Keimdrüsen!',
    lawReference: '§ 5 Abs. 11 StrlSchG',
    pdfSource: 'PDF 1, S. 1 & PDF 2, S. 1',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Sortiere die Gewebewichtungsfaktoren wT in zunehmender Empfindlichkeit (Knochen, Leber, Niere, SD, Lunge, KM, Keimdrüsen)!',
    flashcardBack: '1. Knochen (KNO), Haut: wT = 0,01\n2. Nieren, Leber, Schilddrüse (SD): wT = 0,05\n3. Lunge, rotes Knochenmark (KM): wT = 0,12\n4. Keimdrüsen (Gonaden): wT = 0,20 (am empfindlichsten!)'
  },
  {
    id: 'q-dos-3',
    deckId: 'deck-dosis',
    question: 'Welche Strahlenwichtungsfaktoren (wR) gelten für Photonen (Röntgen/Gamma), Elektronen (Beta), Neutronen und Alpha-Strahlung?',
    options: [
      'Photonen: 1 | Elektronen: 1 | Neutronen: 5–20 (je nach Energie) | Alpha-Strahlung: 20',
      'Photonen: 1 | Elektronen: 5 | Neutronen: 10 | Alpha-Strahlung: 100',
      'Photonen: 0,5 | Elektronen: 1 | Neutronen: 2 | Alpha-Strahlung: 10',
      'Alle Strahlenarten haben wR = 1, nur die Gewebewichtungsfaktoren unterscheiden sich.'
    ],
    correctIndex: 0,
    explanation: 'Die Äquivalentdosis H = D · wR berücksichtigt die biologische Schädlichkeit verschiedener Strahlenarten bei gleicher Energiedosis: Photonen (Röntgen, Gamma) und Elektronen (Beta) haben wR = 1. Neutronen liegen je nach Energie zwischen 5 und 20. Alpha-Strahlung (hoher LET, dicht ionisierend) hat wR = 20.',
    mnemonic: 'Röntgen/Gamma/Beta = 1x; Neutronen = 5–20x; Alpha = 20x so schädlich!',
    lawReference: 'Anlage 18 StrlSchV',
    pdfSource: 'PDF 1, S. 2',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie lauten die Strahlenwichtungsfaktoren wR für Photonen, Elektronen, Neutronen und Alpha-Strahlung?',
    flashcardBack: '• Photonen (Gamma, Röntgen): wR = 1\n• Elektronen (Beta): wR = 1\n• Neutronen: wR = 5–20 (je nach Energie)\n• Alpha-Strahlung (hoher LET): wR = 20\nFormel: H = D · wR [Sv]'
  },
  {
    id: 'q-dos-4',
    deckId: 'deck-dosis',
    question: 'Ein Radionuklid hat eine physikalische Halbwertszeit von 6 Stunden und eine biologische Halbwertszeit von 6 Stunden. Wie groß ist die effektive Halbwertszeit (HWZ_eff)?',
    options: [
      '3 Stunden',
      '12 Stunden',
      '6 Stunden',
      '36 Stunden'
    ],
    correctIndex: 0,
    explanation: 'Mit der Formel HWZ_eff = (HWZ_phys · HWZ_bio) / (HWZ_phys + HWZ_bio) ergibt sich: (6 · 6) / (6 + 6) = 36 / 12 = 3 Stunden. Da physikalischer Zerfall und biologische Ausscheidung gleichzeitig wirken, ist die effektive HWZ immer kürzer als jede der beiden Einzel-Halbwertszeiten!',
    mnemonic: 'HWZ_eff = (phys × bio) / (phys + bio). Sind beide gleich, halbiert sich die Zeit!',
    lawReference: 'Nuklearmedizin / Biokinetik',
    pdfSource: 'PDF 1, S. 3',
    difficulty: 'mittel',
    type: 'calculation',
    flashcardFront: 'Wie lautet die Formel für die effektive Halbwertszeit (HWZ_eff) und was beschreibt sie?',
    flashcardBack: '• Formel: 1/Teff = 1/Tphys + 1/Tbio  bzw.  Teff = (Tphys · Tbio) / (Tphys + Tbio)\n• Bedeutung: Zeit, in der die Radionuklidmenge im Körper durch physikalischen Zerfall UND biologische Ausscheidung zusammen auf die Hälfte sinkt.'
  },
  {
    id: 'q-dos-5',
    deckId: 'deck-dosis',
    question: 'Warum ist das Dosisflächenprodukt (DFP) beim konventionellen Röntgen abstandsunabhängig?',
    options: [
      'Weil mit zunehmendem Abstand die durchstrahlte Fläche quadratisch zunimmt, während die Dosis nach dem Abstandsquadratgesetz im gleichen Maße quadratisch abnimmt.',
      'Weil die Röntgenröhre bei größerem Abstand automatisch die Röhrenspannung (kV) verdoppelt.',
      'Weil Röntgenstrahlen im Vakuum des Raumes keine Streuung erfahren.',
      'Das DFP ist nicht abstandsunabhängig, sondern halbiert sich bei doppeltem Abstand.'
    ],
    correctIndex: 0,
    explanation: 'DFP = Dosis × Fläche [cGy·cm² = µGy·m²]. Nach dem Abstandsquadratgesetz sinkt die Dosis bei doppeltem Abstand auf 1/4, während die bestrahlte Fläche auf das 4-Fache anwächst. Das Produkt (1/4 × 4 = 1) bleibt somit konstant (abstandsunabhängig).',
    mnemonic: 'DFP = Dosis × Fläche: Fläche wächst quadratisch (×r²), Dosis fällt quadratisch (÷r²) → kürzt sich weg!',
    lawReference: 'Dosimetrie / DRW',
    pdfSource: 'PDF 2, S. 25',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wie wird das DFP (Dosisflächenprodukt) berechnet, welche Einheit hat es und warum ist es abstandsunabhängig?',
    flashcardBack: '• Berechnung: Dosis × Nutzstrahlenfläche (Messkammer am Strahlenaustrittsfenster)\n• Einheit: [cGy·cm² = µGy·m²] (Messwert!)\n• Abstandsunabhängig: Fläche nimmt mit Abstand quadratisch zu, Dosis nimmt quadratisch ab (Abstandsquadratgesetz).'
  },
  {
    id: 'q-dos-6',
    deckId: 'deck-dosis',
    question: 'Was versteht man unter dem Linearen Energietransfer (LET) und der Relativen Biologischen Wirksamkeit (RBW)?',
    options: [
      'LET (keV/µm) ist der mittlere Energieverlust ΔE pro Wegstrecke Δs (Maß für Ionisationsdichte); RBW ist der Quotient aus der Dosis einer Referenzstrahlung (Dx) und der Dosis der untersuchten Strahlung (Di) bei gleichem biologischem Effekt.',
      'LET beschreibt die elektrische Leistung des Linearbeschleunigers in Megawatt; RBW ist der Gewebewichtungsfaktor der Lunge.',
      'Hoch-LET-Strahlung sind Röntgen- und Gammastrahlen; Niedrig-LET-Strahlung sind Alphateilchen.',
      'Mit steigendem LET sinkt die biologische Wirksamkeit einer Strahlung auf Null.'
    ],
    correctIndex: 0,
    explanation: 'LET = ΔE / Δs [keV/µm] gibt an, wie viele Ionisationen pro Wegstrecke stattfinden. Hoch-LET-Strahlung (Alpha, schnelle Neutronen, Schwerionen wie C-12) ist dicht ionisierend und biologisch viel wirksamer als Niedrig-LET-Strahlung (Röntgen, Gamma, Elektronen). Beispiel aus Skript 2 S. 28: 35 Doppelstrangbrüche (DSB) entstehen bei 1 Gy Röntgen oder schon bei 0,5 Gy Alpha → RBW = 1 Gy / 0,5 Gy = 2.',
    mnemonic: 'Hoch-LET = Dicht ionisierend (Alpha, Schwerionen) = Hohe RBW!',
    lawReference: 'Strahlenbiologie',
    pdfSource: 'PDF 2, S. 27–28',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Erkläre LET (inkl. Formel & Hoch-/Niedrig-LET Beispielen) und RBW!',
    flashcardBack: '• LET = ΔE / Δs [keV/µm]: Mittlerer Energieverlust pro Wegstrecke (Ionisationsdichte). Biologische Wirkung steigt mit LET!\n• Hoch-LET (dicht ionisierend): Alpha, schnelle Neutronen, C12-Schwerionen\n• Niedrig-LET (locker ionisierend): Röntgen, Gamma, Elektronen\n• RBW = Dx (Referenzdosis) / Di (Testdosis für gleichen Effekt).'
  },
  {
    id: 'q-dos-7',
    deckId: 'deck-dosis',
    question: 'Was definiert die „Spezifische Aktivität“ nach StrlSchV?',
    options: [
      'Das Verhältnis der Aktivität eines Radionuklids zur Masse des Materials, in dem das Radionuklid verteilt ist (Einheit z. B. Bq/g).',
      'Die Aktivität pro Quadratzentimeter Oberfläche (Bq/cm²) beim Wischtest.',
      'Die Zeitspanne, in der die Aktivität von Cäsium-137 auf die Hälfte sinkt.',
      'Die Ortsdosisleistung in 1 Meter Abstand von einer Strahlenquelle.'
    ],
    correctIndex: 0,
    explanation: 'Spezifische Aktivität ist die auf die Masse bezogene Aktivität eines radioaktiven Stoffes (Bq/g oder Bq/kg). Davon zu unterscheiden ist die flächenbezogene Aktivität (Bq/cm²) bei der Oberflächenkontamination.',
    mnemonic: 'Spezifisch = bezogen auf die Masse (Bq pro Gramm)!',
    lawReference: 'Anlage / Begriffsbestimmungen StrlSchV Nr. 17',
    pdfSource: 'PDF 1, S. 1 & PDF 2, S. 6',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Was ist die „Spezifische Aktivität“?',
    flashcardBack: 'Das Verhältnis der Aktivität eines Radionuklids zur Masse des Materials, in dem das Radionuklid verteilt ist (auf die Masse bezogene Aktivität, z. B. in Bq/g).'
  },

  // ================= DECK 3: PERSONENDOSIMETRIE, MESSGRÖSSEN & DRW =================
  {
    id: 'q-mes-1',
    deckId: 'deck-dosimetrie',
    question: 'In welchen Gewebetiefen werden die Personendosis-Messgrößen Hp(10), Hp(3) und Hp(0,07) ermittelt und wofür stehen sie?',
    options: [
      'Hp(10): 10 mm Tiefe (Tiefen-Personendosis / Ganzkörper); Hp(3): 3 mm Tiefe (Augenlinse); Hp(0,07): 0,07 mm Tiefe (Oberflächen-Personendosis / Haut & Hände)',
      'Hp(10): 10 cm Tiefe; Hp(3): 3 cm Tiefe; Hp(0,07): 7 mm Tiefe',
      'Hp(10): 10 m Abstand; Hp(3): 3 m Abstand; Hp(0,07): 0,07 m Abstand',
      'Die Zahlen geben die maximale Tragedauer des Dosimeters in Wochen an.'
    ],
    correctIndex: 0,
    explanation: 'Laut Anlage 18 StrlSchV gilt für die Personendosis: Hp(10) = Tiefen-Personendosis in 10 mm Tiefe (Schätzwert für die effektive Dosis mit Ganzkörperdosimeter), Hp(3) = Augenlinsen-Personendosis in 3 mm Tiefe, Hp(0,07) = Oberflächen-Personendosis in 0,07 mm Tiefe (Haut, Extremitäten/Ringdosimeter).',
    mnemonic: 'Zahl in Klammern = Tiefe in Millimetern! 10 mm (Körper), 3 mm (Auge), 0,07 mm (Haut).',
    lawReference: 'Anlage 18 Teil A StrlSchV',
    pdfSource: 'PDF 1, S. 2 & PDF 2, S. 6',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Was bedeuten Hp(10), Hp(3) und Hp(0,07) in der Personendosimetrie?',
    flashcardBack: '• Hp(10): Tiefen-Personendosis in 10 mm Tiefe (Ganzkörperdosimeter → effektive Dosis)\n• Hp(3): Augenlinsen-Personendosis in 3 mm Tiefe\n• Hp(0,07): Oberflächen-Personendosis in 0,07 mm Tiefe (Haut/Hände, z.B. Ringdosimeter)'
  },
  {
    id: 'q-mes-2',
    deckId: 'deck-dosimetrie',
    question: 'Was ist beim Tragen von Dosimetern bei einer schwangeren Mitarbeiterin und beim Tragen eines Ringdosimeters zu beachten?',
    options: [
      'Schwangere tragen zusätzlich zum Rumpfdosimeter ein direkt ablesbares Dosimeter auf Höhe des Uterus (sichtbar, nichts drüber hängen, 1x/Woche auslesen); beim Ringdosimeter zeigt die Detektorfläche nach innen.',
      'Schwangere geben ihr amtliches OSL-Dosimeter ab und tragen nur noch ein Ringdosimeter am Finger.',
      'Das Uterus-Dosimeter muss unter einer Bleischürze versteckt und nur alle 6 Monate abgelesen werden.',
      'Beim Ringdosimeter muss die Detektorfläche immer nach außen zum Handrücken zeigen.'
    ],
    correctIndex: 0,
    explanation: 'Schwangere erhalten zusätzlich zum amtlichen Ganzkörperdosimeter (monatlich) ein direkt ablesbares Dosimeter auf Höhe des Uterus, das sichtbar getragen (nichts drüber hängen wegen Strahlenschwächung!) und 1x pro Woche ausgelesen wird. Beim Ringdosimeter sitzt der Ring so weit vorne, dass man noch arbeiten kann, mit der Detektorfläche zur Handinnenseite.',
    mnemonic: 'Schwangere = 2 Dosimeter (Uterus 1x/Woche + Rumpf 1x/Monat). Ringdosimeter = Detektor nach innen!',
    lawReference: '§ 78 / § 69 StrlSchV',
    pdfSource: 'PDF 1, S. 2, 8 & PDF 2, S. 23',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wie erfolgt die Dosimetrie bei Schwangeren und wie trägt man ein Ringdosimeter korrekt?',
    flashcardBack: '• Schwangere: Amtliches Rumpfdosimeter (monatl.) + direkt ablesbares Dosimeter auf Höhe des Uterus (sichtbar, nichts drüber hängen!), 1x wöchentlich auslesen.\n• Ringdosimeter: So weit vorne wie möglich, Detektorfläche nach INNEN!'
  },
  {
    id: 'q-mes-3',
    deckId: 'deck-dosimetrie',
    question: 'Welche Aussage zu Diagnostischen Referenzwerten (DRW, § 125 StrlSchV) und Dosisrichtwerten ist richtig?',
    options: [
      'DRW sind KEINE Grenzwerte, sondern optimierungsorientierte Vergleichswerte für Standarduntersuchungen am Menschen (vom BfS erstellt, spätestens alle 3 Jahre geprüft); bei medizinischer Begründung (z. B. Adipositas) dürfen sie überschritten werden.',
      'DRW sind rechtlich bindende Personen-Grenzwerte für MTRs, die niemals überschritten werden dürfen.',
      'Dosisrichtwerte gelten für Patienten, während DRW nur für das Reinigungspersonal gelten.',
      'DRW werden monatlich vom Krankenhausträger selbst festgelegt.'
    ],
    correctIndex: 0,
    explanation: 'Referenzwerte (DRW nach § 125) gelten für Standarduntersuchungen am Menschen. Sie sind keine Grenzwerte, sondern zeigen an, wann Optimierungsmaßnahmen sinnvoll sind. Eine Überschreitung im Einzelfall (z. B. adipöser Patient, damit das Bild befundbar wird) ist erlaubt, muss aber begründet und dokumentiert werden. Das BfS prüft die DRW spätestens alle 3 Jahre, die Ärztliche Stelle sammelt die Daten alle 2 Jahre (bzw. jährliche Übermittlung). Dosisrichtwerte hingegen dienen der Planung/Optimierung für beruflich exponiertes Personal.',
    mnemonic: 'DRW = Patient (Standarduntersuchung, BfS alle 3 J.); Dosisrichtwert = Personal-Planung; Grenzwert = Gesetzliches Limit!',
    lawReference: '§ 125 StrlSchV',
    pdfSource: 'PDF 1, S. 3, 14 & PDF 2, S. 4, 25',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Unterschied zwischen Grenzwert, Dosisrichtwert und Diagnostischem Referenzwert (DRW, § 125)?',
    flashcardBack: '• Grenzwert: Rechtlich bindendes Maximum (z.B. 20 mSv/a Personal), darf nicht überschritten werden.\n• Dosisrichtwert: Interner oberer Planungswert für berufl. exponiertes Personal (Aufbewahrung 5 J. nach Tätigkeitsende).\n• DRW (§ 125): Vergleichswert vom BfS für Standarduntersuchungen an Patienten (kein Grenzwert! Prüfung durch BfS alle 3 J.).'
  },
  {
    id: 'q-mes-4',
    deckId: 'deck-dosimetrie',
    question: 'Welche Messgrößen werden für die Ortsdosis laut Anlage 18 StrlSchV verwendet und welche Absperrgrenze gilt beim Dosisleistungsmessgerät im Strahlenschutzeinsatz?',
    options: [
      'Umgebungs-Äquivalentdosis H*(10) sowie Richtungs-Äquivalentdosis H\'(3,Ω) und H\'(0,07,Ω); die Absperrgrenze beim Einsatz liegt bei 25 µSv/h.',
      'Tiefen-Personendosis Hp(10); die Absperrgrenze liegt bei 500 mSv/h.',
      'Nur das Dosisflächenprodukt (DFP); die Absperrgrenze liegt bei 300 Bq/m³.',
      'Die Ortsdosis wird ausschließlich mit dem Hand-Fuß-Monitor in Becquerel gemessen.'
    ],
    correctIndex: 0,
    explanation: 'Für die Ortsdosis gelten die Messgrößen mit Stern/Strich: Umgebungs-Äquivalentdosis H*(10) in 10 mm Tiefe der ICRU-Kugel sowie die Richtungs-Äquivalentdosis H\'(3,Ω) und H\'(0,07,Ω). Dosisleistungsmessgeräte zeigen die aktuelle ODL als Momentanzeige an und dienen bei Einsätzen u. a. zum Festlegen der Absperrgrenze (25 µSv/h).',
    mnemonic: 'Personendosis hat ein „p“ wie Person → Hp(10). Ortsdosis hat Stern/Strich → H*(10), H\'(3,Ω), H\'(0,07,Ω)!',
    lawReference: 'Anlage 18 StrlSchV',
    pdfSource: 'PDF 2, S. 5–6',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Wie heißen die Messgrößen der Ortsdosis nach Anlage 18 StrlSchV (im Vergleich zur Personendosis)?',
    flashcardBack: '• Ortsdosis: Umgebungs-Äquivalentdosis H*(10) sowie Richtungs-Äquivalentdosis H\'(3,Ω) und H\'(0,07,Ω) an der ICRU-Kugel.\n• Personendosis: Hp(10), Hp(3), Hp(0,07).\n• Absperrgrenze beim Strahlenschutzeinsatz (ODL-Messgerät): 25 µSv/h.'
  },
  {
    id: 'q-mes-5',
    deckId: 'deck-dosimetrie',
    question: 'Welche Anforderungen stellt § 90 an Strahlungsmessgeräte und wie lange müssen die Prüf- und Wartungsunterlagen aufbewahrt werden?',
    options: [
      'Sie müssen dem Messzweck dienen, in ausreichender Anzahl vorhanden sein, regelmäßig auf Funktion geprüft und gewartet werden; Aufbewahrungsfrist der Prüfungen: 10 Jahre.',
      'Es reicht ein einziges Messgerät pro Bundesland; Aufbewahrungsfrist: 1 Jahr.',
      'Strahlungsmessgeräte sind wartungsfrei und müssen nur bei Defekt dokumentiert werden.',
      'Die Wartungsunterlagen müssen 100 Jahre lang beim Bundesamt für Strahlenschutz archiviert werden.'
    ],
    correctIndex: 0,
    explanation: 'Nach § 90 müssen Strahlungsmessgeräte den Anforderungen des Messzwecks genügen, in ausreichender Zahl vorhanden sein und regelmäßig geprüft/gewartet werden. Zeitpunkt und Ergebnis der Prüfung sind aufzuzeichnen und 10 Jahre aufzubewahren.',
    mnemonic: '§ 90 Messgeräte-Wartung = 10 Jahre aufbewahren!',
    lawReference: '§ 90 StrlSchV',
    pdfSource: 'PDF 1, S. 4, 13',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Welche 5 Punkte gelten für Strahlungsmessgeräte (§ 90) inkl. Aufbewahrungsfrist?',
    flashcardBack: '1. Müssen den Anforderungen des Messzwecks dienen\n2. In ausreichender Anzahl vorhanden sein\n3. Regelmäßig auf Funktion geprüft & gewartet werden\n4. Zeitpunkt & Ergebnis der Prüfung aufzeichnen\n5. Unterlagen 10 Jahre aufzubewahren!'
  },

  // ================= DECK 4: GRENZWERTE, KATEGORIEN & SCHUTZBEREICHE =================
  {
    id: 'q-gre-1',
    deckId: 'deck-grenzwerte',
    question: 'RECHENAUFGABE (aus dem Skript): An einem Schaltpult wird eine Ortsdosisleistung (ODL) von 7 µSv/h gemessen. Das Bestrahlungsgerät läuft 10 Stunden pro Tag (5 Tage/Woche, 50 Wochen/Jahr). Ist der Betrieb ohne weitere Schutzmaßnahmen im Überwachungsbereich erlaubt?',
    options: [
      'Nein! 7 µSv/h × 10 h/d × 5 d/Woche × 50 Wochen = 17,5 mSv/a. Damit wird der maximale Grenzwert des Überwachungsbereichs von 6 mSv/a deutlich überschritten.',
      'Ja, denn 7 µSv/h ergibt nur 1,75 mSv/a und liegt damit unter dem Grenzwert von 6 mSv/a.',
      'Ja, weil am Schaltpult ein Grenzwert von 500 mSv/a für die effektive Dosis gilt.',
      'Nein, weil im Überwachungsbereich maximal 0,1 mSv/a erlaubt sind.'
    ],
    correctIndex: 0,
    explanation: 'Standard-Rechenweg im Strahlenschutz: Man geht von 40 Arbeitsstunden/Woche (5 Tage) und 50 Wochen/Jahr (= 2000 h/a) aus. Hier läuft das Gerät 10 h/d × 5 d × 50 Wo = 2500 h/a. Dosis = 7 µSv/h × 2500 h = 17.500 µSv = 17,5 mSv/a. Da im Überwachungsbereich (Schaltpult) maximal 6 mSv/a erlaubt sind, ist der Betrieb so NICHT erlaubt!',
    mnemonic: 'Rechnung: ODL × Stunden/Tag × 5 Tage × 50 Wochen. Schaltpult = Überwachungsbereich = max. 6 mSv/a!',
    lawReference: '§ 52 StrlSchV / Rechenaufgabe Skript 1',
    pdfSource: 'PDF 1, S. 8',
    difficulty: 'mittel',
    type: 'calculation',
    flashcardFront: 'Rechenaufgabe: Am Schaltpult werden 7 µSv/h gemessen, Gerät läuft 10 h/d (5 d/Wo, 50 Wo/a). Ist der Betrieb erlaubt?',
    flashcardBack: '• Rechnung: 7 µSv/h × 10 h/d × 5 d/Wo × 50 Wo = 17.500 µSv/a = 17,5 mSv/a.\n• Ergebnis: NEIN, Betrieb nicht erlaubt, da der Grenzwert des Überwachungsbereichs (Schaltpult) von 6 mSv/a überschritten wird!'
  },
  {
    id: 'q-gre-2',
    deckId: 'deck-grenzwerte',
    question: 'Wie sind Überwachungsbereich, Kontrollbereich und Sperrbereich hinsichtlich ihrer Dosis- bzw. ODL-Schwellenwerte definiert?',
    options: [
      'Überwachungsbereich: > 1 bis ≤ 6 mSv/a (> 0,5 bis ≤ 3 µSv/h) | Kontrollbereich: > 6 bis 20 mSv/a (> 3 µSv/h bis ≤ 3 mSv/h) | Sperrbereich: ODL > 3 mSv/h',
      'Überwachungsbereich: < 0,1 mSv/a | Kontrollbereich: 1 bis 2 mSv/a | Sperrbereich: > 6 mSv/a',
      'Überwachungsbereich: > 20 mSv/a | Kontrollbereich: > 50 mSv/a | Sperrbereich: > 500 mSv/a',
      'Alle drei Bereiche beginnen ab einer Ortsdosisleistung von 10 mSv/h.'
    ],
    correctIndex: 0,
    explanation: 'Sobald der Grenzwert für Einzelpersonen der Bevölkerung (1 mSv/a bzw. 0,5 µSv/h) überschritten werden kann, sind Strahlenschutzbereiche einzurichten: 1. Überwachungsbereich (> 1 bis 6 mSv/a; > 0,5 bis 3 µSv/h; Haut > 50 mSv/a), 2. Kontrollbereich (> 6 bis 20 mSv/a; > 3 µSv/h bis 3 mSv/h; Augenlinse > 15 mSv/a; Haut > 150 mSv/a), 3. Sperrbereich als Teil des Kontrollbereichs bei ODL > 3 mSv/h („Sperrbereich – kein Zutritt“).',
    mnemonic: 'Effektive Dosis: >1 mSv (Überwachung), >6 mSv (Kontrolle). ODL: >0,5 µSv/h → >3 µSv/h → >3 mSv/h (Sperr)!',
    lawReference: '§ 52 StrlSchV',
    pdfSource: 'PDF 1, S. 9–10 & PDF 2, S. 1–2',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Grenzwerte (Deff und ODL) gelten für Überwachungs-, Kontroll- und Sperrbereich?',
    flashcardBack: '• Allgemeines Staatsgebiet: ≤ 1 mSv/a (≤ 0,5 µSv/h)\n• Überwachungsbereich: > 1 bis ≤ 6 mSv/a (> 0,5 bis ≤ 3 µSv/h), Haut > 50 mSv\n• Kontrollbereich: > 6 bis 20 mSv/a (> 3 µSv/h bis ≤ 3 mSv/h), Auge > 15 mSv, Haut > 150 mSv\n• Sperrbereich: ODL > 3 mSv/h'
  },
  {
    id: 'q-gre-3',
    deckId: 'deck-grenzwerte',
    question: 'Worin unterscheiden sich beruflich strahlenexponierte Personen der Kategorie A und der Kategorie B?',
    options: [
      'Kat. A (> 6 bis max. 20 mSv/a): jährliche ärztliche Untersuchung Pflicht; Kat. B (> 1 bis max. 6 mSv/a): ärztliche Untersuchung vor Aufnahme, danach optional (am UKHD alle 3 Jahre).',
      'Kat. A sind Auszubildende unter 18 Jahren; Kat. B sind Chefärzte.',
      'Kat. A darf maximal 1 mSv/a erhalten; Kat. B darf bis zu 400 mSv/a erhalten.',
      'Kat. B benötigt kein Dosimeter und keine Strahlenschutz-Unterweisung.'
    ],
    correctIndex: 0,
    explanation: 'Kategorie B („wir“ im normalen MTR-Alltag): Effektive Dosis > 1 bis max. 6 mSv/a, Augenlinse > 15 mSv/a, Haut/Extremitäten > 50 mSv/a. Ärztliche Untersuchung vor/nach Tätigkeitsaufnahme, Wiederholung am UKHD alle 3 Jahre. Kategorie A: Effektive Dosis > 6 bis max. 20 mSv/a, Augenlinse 20 mSv/a, Haut/Extremitäten > 150 bis 500 mSv/a → jährliche ärztliche Untersuchung durch ermächtigten Arzt zwingend erforderlich!',
    mnemonic: 'Kat. B = Bis 6 mSv/a (Betriebsarzt 3 J.); Kat. A = Ab 6 bis 20 mSv/a (Arzt 1x/Jahr)!',
    lawReference: '§ 78 StrlSchG / § 71 StrlSchV',
    pdfSource: 'PDF 1, S. 8, 14 & PDF 2, S. 22',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Vergleiche Kategorie A und Kategorie B bei beruflich strahlenexponierten Personen!',
    flashcardBack: '• Kategorie A: Deff > 6 bis max. 20 mSv/a (Haut > 150 mSv/a) → Jährliche ärztliche Untersuchung Pflicht!\n• Kategorie B („wir“): Deff > 1 bis max. 6 mSv/a (Auge > 15 mSv/a, Haut > 50 mSv/a) → Ärztl. Untersuchung bei Einstellung, Auffrischung alle 3 Jahre (UKHD).'
  },
  {
    id: 'q-gre-4',
    deckId: 'deck-grenzwerte',
    question: 'Welche Jahresgrenzwerte gelten nach § 78 StrlSchG für erwachsene beruflich strahlenexponierte Personen (ab 18 J.) im Vergleich zu Auszubildenden unter 18 Jahren?',
    options: [
      'Ab 18 J.: Deff 20 mSv/a, Augenlinse 20 mSv/a, Haut/Extremitäten 500 mSv/a | Unter 18 J.: Deff 1 mSv/a, Augenlinse 15 mSv/a, Haut/Extremitäten 50 mSv/a',
      'Ab 18 J.: Deff 50 mSv/a, Augenlinse 150 mSv/a, Haut 1000 mSv/a | Unter 18 J.: Deff 6 mSv/a, Augenlinse 20 mSv/a, Haut 150 mSv/a',
      'Für beide Gruppen gelten identische Grenzwerte von 20 mSv/a.',
      'Unter 18-Jährige dürfen überhaupt nicht in der Radiologie ausgebildet werden.'
    ],
    correctIndex: 0,
    explanation: 'Erwachsene (≥ 18 J.): Effektive Dosis 20 mSv/a (im Einzelfall bis 50 mSv/a, aber in 5 Folgejahren max. 100 mSv), Augenlinse 20 mSv/a, lokale Hautdosis/Hände/Füße/Knöchel 500 mSv/a. Unter 18-Jährige (Azubis): Effektive Dosis 1 mSv/a, Augenlinse 15 mSv/a, Haut/Extremitäten 50 mSv/a (entspricht den Werten für die Bevölkerung!).',
    mnemonic: 'Ab 18: 20 / 20 / 500 mSv. Unter 18 (wie Bevölkerung): 1 / 15 / 50 mSv!',
    lawReference: '§ 78 Abs. 1–3 StrlSchG',
    pdfSource: 'PDF 1, S. 8 & PDF 2, S. 14, 23',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Jahresgrenzwerte für beruflich Exponierte ≥ 18 Jahre vs. < 18 Jahre (Deff, Augenlinse, Haut/Extremitäten)?',
    flashcardBack: 'Ab 18 Jahre:\n• Effektive Dosis: 20 mSv/a\n• Augenlinse: 20 mSv/a\n• Haut, Hände, Unterarme, Füße, Knöchel: 500 mSv/a\n\nUnter 18 Jahre (& Bevölkerung):\n• Effektive Dosis: 1 mSv/a\n• Augenlinse: 15 mSv/a\n• Haut & Extremitäten: 50 mSv/a'
  },
  {
    id: 'q-gre-5',
    deckId: 'deck-grenzwerte',
    question: 'Wie hoch ist die gesetzliche Berufslebensdosis (§ 77 StrlSchG) und was passiert, wenn sie erreicht bzw. überschritten wird?',
    options: [
      '400 mSv; bei Überschreitung kann mit schriftlicher Zustimmung (Behörde, ermächtigter Arzt, betroffene Person, AG, SSB) für maximal 5 weitere Jahre eine effektive Dosis von max. 10 mSv/Jahr zugelassen werden – danach ist endgültig Schluss.',
      '100 mSv; danach darf man unbegrenzt mit 20 mSv/Jahr weiterarbeiten.',
      '500 mSv; bei Überschreitung wird man automatisch in Kategorie B zurückgestuft.',
      'Es gibt in Deutschland keine Berufslebensdosis mehr.'
    ],
    correctIndex: 0,
    explanation: 'Die Summe der in allen Kalenderjahren ermittelten effektiven Dosen darf 400 mSv nicht überschreiten (§ 77 StrlSchG). Im Ausnahmefall kann die zuständige Behörde im Einvernehmen mit dem ermächtigten Arzt und der Person (sowie AG und SSB, alles schriftlich!) einer weiteren Beschäftigung mit max. 10 mSv/Jahr für 5 Jahre zustimmen.',
    mnemonic: '400 mSv Berufsleben → Nachspielzeit: max. 5 Jahre × 10 mSv/a (schriftlich!), danach Feierabend!',
    lawReference: '§ 77 StrlSchG',
    pdfSource: 'PDF 1, S. 9 & PDF 2, S. 14, 22',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie hoch ist die Berufslebensdosis (§ 77 StrlSchG) und welche Ausnahmeregelung gibt es bei Überschreitung?',
    flashcardBack: '• Grenzwert: 400 mSv (Summe aller Kalenderjahre)\n• Ausnahme bei Überschreitung: Mit allseits schriftlicher Zustimmung (Behörde, ermächtigter Arzt, Person, AG, SSB) für max. 5 weitere Jahre bis zu 10 mSv/a erlaubt – danach endgültig vorbei.'
  },
  {
    id: 'q-gre-6',
    deckId: 'deck-grenzwerte',
    question: 'Welche Dosisgrenzwerte gelten nach § 78 Abs. 4 StrlSchG für gebärfähige Frauen sowie für das ungeborene Kind während einer Schwangerschaft – und ab welcher Embryonaldosis besteht laut Skript eine Interruptio-Indikation?',
    options: [
      'Gebärmutter bei gebärfähigen Frauen: 2 mSv/Monat | Ungeborenes Kind: 1 mSv ab Mitteilung bis Ende der SS | Über 100 mSv Embryonaldosis: Interruptio-Indikation (ab 300 mSv in der 10. Woche: Gehirnfehlentwicklung).',
      'Gebärmutter: 20 mSv/Monat | Ungeborenes Kind: 10 mSv pro Schwangerschaft | Interruptio ab 5 mSv.',
      'Gebärfähige Frauen haben keinen monatlichen Grenzwert, erst ab dem 6. Schwangerschaftsmonat gilt 1 mSv.',
      'Ungeborenes Kind: 2 mSv/Woche; Gebärmutter: 50 mSv/Jahr.'
    ],
    correctIndex: 0,
    explanation: 'Für gebärfähige Frauen gilt für die Gebärmutter (Uterus) ein Grenzwert von 2 mSv/Monat. Für das ungeborene Kind gilt vom Zeitpunkt der Mitteilung der Schwangerschaft bis zu deren Ende ein Grenzwert von 1 mSv. Laut Skript 2 (S. 23): Bei einer Embryonaldosis über 100 mSv besteht eine Indikation zur Interruptio (4 Wochen nach letzter Blutung 50–100 mSv → Herzfehler/Nervensystem; 10 Wochen nach Regelblutung 300 mSv → Fehlentwicklung des Gehirns).',
    mnemonic: 'Uterus = 2 mSv/Monat; Baby = 1 mSv für die gesamte restliche SS; >100 mSv = Interruptio!',
    lawReference: '§ 78 Abs. 4 StrlSchG / § 69 StrlSchV',
    pdfSource: 'PDF 1, S. 9 & PDF 2, S. 14, 23',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Grenzwerte gelten für gebärfähige Frauen und Schwangere (§ 78 Abs. 4) und welche Schwellenwerte gelten für den Embryo?',
    flashcardBack: '• Gebärfähige Frauen (Gebärmutter/Uterus): max. 2 mSv/Monat\n• Ungeborenes Kind: max. 1 mSv ab Mitteilung bis Ende der SS\n• Embryo-Schäden: > 100 mSv → Interruptio; 4. Wo (50–100 mSv) → Herz/Nerven; 10. Wo (300 mSv) → Gehirnfehlentwicklung.'
  },
  {
    id: 'q-gre-7',
    deckId: 'deck-grenzwerte',
    question: 'Was ist der Unterschied zwischen einem permanenten und einem temporären Strahlenschutzbereich (mit Beispielen aus dem Klinikalltag)?',
    options: [
      'Ein permanenter Kontrollbereich besteht dauerhaft (z. B. Heißlabor in der Nuklearmedizin); ein temporärer Bereich ändert seinen Status je nach Betriebszustand (z. B. Röntgenraum nur während der Einschaltzeit oder LB-Raum: Bestrahlung = Sperrbereich, kurz nach Abschalten = Kontrollbereich, danach = Überwachungsbereich).',
      'Ein permanenter Bereich gilt nur nachts, ein temporärer Bereich nur tagsüber.',
      'Röntgenräume sind immer permanente Sperrbereiche, auch wenn das Gerät ausgeschaltet ist.',
      'Ein Heißlabor in der Nuklearmedizin ist nur für 5 Minuten am Tag ein Überwachungsbereich.'
    ],
    correctIndex: 0,
    explanation: 'Beim Umgang mit offenen radioaktiven Stoffen (Heißlabor in der NUK) strahlt die Quelle ständig → permanenter Kontrollbereich. Röntgenstrahler/Störstrahler erzeugen Strahlung nur während der Einschaltzeit → temporärer Kontrollbereich. Beim Linearbeschleuniger (LB) in der Strahlentherapie ist der Raum während der Bestrahlung ein Sperrbereich (> 3 mSv/h), kurz nach dem Abschalten ein Kontrollbereich (Aktivierung!) und danach ein Überwachungsbereich.',
    mnemonic: 'NUK Heißlabor = Permanent (strahlt immer); Röntgen = Temporär (nur wenn an); LB = Sperr → Kontroll → Überwachung!',
    lawReference: '§ 52 StrlSchV',
    pdfSource: 'PDF 1, S. 9–10 & PDF 2, S. 2',
    difficulty: 'mittel',
    type: 'case',
    flashcardFront: 'Gib Beispiele für permanente und temporäre Strahlenschutzbereiche (Röntgen, NUK, Strahlentherapie)!',
    flashcardBack: '• Permanent: Heißlabor in der Nuklearmedizin (dauerhaft Kontrollbereich).\n• Temporär (Röntgen): Nur während Einschaltzeit & Betriebsbereitschaft Kontrollbereich.\n• Temporär (LB-Raum Strahlentherapie): Bei Bestrahlung = Sperrbereich (>3 mSv/h) → kurz nach Abschalten = Kontrollbereich → danach = Überwachungsbereich.'
  },

  // ================= DECK 5: BETRIEBLICHE ORGANISATION, INBETRIEBNAHME & RECHT =================
  {
    id: 'q-org-1',
    deckId: 'deck-organisation',
    question: 'Welche Aussage zu SSV (Strahlenschutzverantwortlicher), SSBV (Strahlenschutzbevollmächtigter), SSB (Strahlenschutzbeauftragter) und MPE (Medizinphysik-Experte) ist vollkommen korrekt?',
    options: [
      'Der SSV braucht selbst keine Fachkunde/Kenntnisse (aber ein Führungszeugnis alle 5 J.); der SSB wird vom SSV schriftlich bestellt, hat bis 1 Jahr nach Niederlegung erhöhten Kündigungsschutz und muss bei einem Vorkommnis innerhalb von 15 Min. vor Ort sein; der MPE darf Strahlung auslösen, aber NICHT am Menschen anwenden.',
      'Der SSV muss zwingend selbst Facharzt für Radiologie sein und der SSB haftet allein, sodass der SSV von allen Pflichten befreit ist.',
      'Der MPE stellt die rechtfertigende Indikation und darf Patienten eigenständig röntgen.',
      'Ein SSB braucht kein Führungszeugnis und kann jederzeit fristlos gekündigt werden, wenn er Mängel meldet.'
    ],
    correctIndex: 0,
    explanation: 'Vergleichstabelle aus Skript 1 (S. 6–7): Der SSV (z. B. Klinikvorstand Prof. Debus / Prof. Autenrieth) trägt die oberste rechtliche Pflicht (auch wenn er Aufgaben an den SSB delegiert!), braucht selbst KEINE Fachkunde, aber ein Führungszeugnis (alle 5 J.). SSBV (Hr. Knoch, Fr. Soiné), SSB und MPE brauchen alle Fachkunde (Aktualisierung alle 5 J.) UND ein Führungszeugnis (alle 5 J.). Der SSB genießt Benachteiligungsverbot, 1 Jahr nachwirkenden Kündigungsschutz und muss bei einem Vorkommnis in 15 Minuten vor Ort sein. Der MPE (Hr. Ötzel) hat einen Master in Med. Physik und darf Strahlung zu Prüfzwecken auslösen, aber nicht am Menschen anwenden.',
    mnemonic: 'SSV = Chef (keine FK nötig, bleibt rechtlich in der Pflicht); SSB = 15 Min vor Ort + 1 J. Kündigungsschutz; MPE = Physik-Master (nicht am Menschen!).',
    lawReference: '§§ 69–75 StrlSchG',
    pdfSource: 'PDF 1, S. 6–7 & PDF 2, S. 12, 24',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Vergleiche SSV, SSBV, SSB und MPE hinsichtlich Fachkunde, Führungszeugnis und Besonderheiten!',
    flashcardBack: '• Führungszeugnis (alle 5 J.): ALLE 4 brauchen es (SSV, SSBV, SSB, MPE)!\n• Fachkunde (alle 5 J.): SSBV, SSB und MPE = JA; SSV = NEIN (braucht auch keine Kenntnisse).\n• SSV: Rechtlich verantwortlich (auch bei Delegation!), kann juristische Person sein.\n• SSB: Schriftlich bestellt, 1 J. Kündigungsschutz nach Ende, in 15 Min. vor Ort bei Vorkommnis.\n• MPE: Master Med. Physik, darf Strahlung auslösen, aber NICHT am Menschen anwenden!'
  },
  {
    id: 'q-org-2',
    deckId: 'deck-organisation',
    question: 'Wie lauten die 6 Schritte bis zur Inbetriebnahme eines neuen medizinischen Strahlengeräts in der richtigen Reihenfolge?',
    options: [
      '1. Gerät aussuchen → 2. Anlieferung & Montage → 3. Abnahmeprüfung → 4. Sicherheitstechnische Kontrolle (STK) → 5. Sachverständigenprüfung → 6. Anmeldung bei ärztlicher/zahnärztlicher Stelle sowie zuständiger Behörde',
      '1. Anmeldung bei Behörde → 2. Sachverständigenprüfung → 3. Gerät aussuchen → 4. Konstanzprüfung → 5. Abnahmeprüfung → 6. Montage',
      '1. Gerät kaufen → 2. Sofort Patienten röntgen → 3. Nach 5 Jahren Abnahmeprüfung → 4. Meldung ans BfS',
      '1. Konstanzprüfung → 2. Abnahmeprüfung → 3. Bauartzulassung beantragen → 4. Montage'
    ],
    correctIndex: 0,
    explanation: 'Die 6 Schritte bis zur Inbetriebnahme (Skript 1 S. 5 & Skript 2 S. 8–9): 1) Gerät aussuchen, 2) Anlieferung und Montage, 3) Abnahmeprüfung (durch Hersteller/Lieferant), 4) Sicherheitstechnische Kontrolle, 5) Sachverständigenprüfung (Bauplan, Fachkundenachweise etc.), 6) Anmeldung des Gerätes bei der ärztlichen Stelle sowie bei der zuständigen Behörde (Anzeige- oder Genehmigungsverfahren).',
    mnemonic: 'Aussuchen → Aufbauen → Abnahme → STK → Sachverständiger → Anmelden!',
    lawReference: '§§ 12, 19 StrlSchG',
    pdfSource: 'PDF 1, S. 5 & PDF 2, S. 8–9',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Nenne die 6 Schritte bis zur Inbetriebnahme eines Röntgengeräts in der richtigen Reihenfolge!',
    flashcardBack: '1. Gerät aussuchen\n2. Anlieferung und Montage\n3. Abnahmeprüfung (durch Hersteller/Lieferant)\n4. Sicherheitstechnische Kontrolle (STK)\n5. Sachverständigenprüfung (Bauplan, FK-Nachweise etc.)\n6. Anmeldung bei ärztlicher Stelle & zuständiger Behörde (Genehmigung oder Anzeige)'
  },
  {
    id: 'q-org-3',
    deckId: 'deck-organisation',
    question: 'Wann reicht ein Anzeigeverfahren (§ 19 StrlSchG) aus und wann ist zwingend ein Genehmigungsverfahren (§ 12 StrlSchG) erforderlich?',
    options: [
      'Anzeigeverfahren: Neue Röntgengeräte in der Diagnostik MIT CE-Zeichen, Bauartzulassung, erfolgter Abnahmeprüfung & SV-Bescheinigung | Genehmigungsverfahren: Immer bei Strahlentherapie (Behandlung am Menschen), Teleradiologie, Früherkennung (Screening), mobilen Röntgenräumen oder Altgeräten ohne CE-Zeichen.',
      'In der Strahlentherapie (Teletherapie) reicht immer ein kurzes Anzeigeverfahren, während Diagnostik-Geräte immer eine Genehmigung brauchen.',
      'Ein Anzeigeverfahren gilt nur für Kernkraftwerke, ein Genehmigungsverfahren nur für Zahnärzte.',
      'Sobald ein Gerät ein CE-Zeichen hat, darf man auch Teleradiologie und Strahlentherapie ohne Genehmigung betreiben.'
    ],
    correctIndex: 0,
    explanation: 'Klassische Prüfungsfrage („Kann man ein Anzeigeverfahren anstreben für ein Gerät in der Strahlentherapie? – Nein, geht nur in Diagnostik, auch in Teletherapie muss man Genehmigungsverfahren machen!“). Eine Genehmigung (§ 12 / § 19) braucht man immer bei: Anlagen zur Behandlung von Menschen (Strahlentherapie), Teleradiologie, Früherkennung (Screening), Betrieb ohne CE-Zeichen / ohne SV-Bescheinigung oder mobilem Röntgenraum. Beim Anzeigeverfahren liegen Prüfbericht MIT Bescheinigung des SV, CE-Zeichen und Abnahmeprüfung vor.',
    mnemonic: 'Therapie, Teleradiologie, Screening, Kein CE = IMMER Genehmigung! Neues Diagnostik-Gerät mit CE + SV-Bescheinigung = Anzeige!',
    lawReference: '§§ 12, 19, 20 StrlSchG',
    pdfSource: 'PDF 1, S. 5 & PDF 2, S. 8–11',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wann gilt das Anzeigeverfahren und wann braucht man zwingend eine Genehmigung (§§ 12, 19 StrlSchG)?',
    flashcardBack: '• Anzeigeverfahren: Neue Diagnostik-Röntgengeräte MIT CE-Zeichen, Bauartzulassung, Hersteller-Abnahmeprüfung + SV-Prüfbericht MIT Bescheinigung.\n• Genehmigungsverfahren zwingend bei:\n  1. Strahlentherapie (Behandlung von Menschen)\n  2. Teleradiologie\n  3. Früherkennung (Screening)\n  4. Kein CE-Zeichen / Altgeräte / Änderungen\n  5. Mobiler Röntgenraum / SV verweigert Bescheinigung'
  },
  {
    id: 'q-org-4',
    deckId: 'deck-organisation',
    question: 'Worin unterscheiden sich Abnahmeprüfung, Konstanzprüfung und Sachverständigenprüfung hinsichtlich Durchführung, Intervall und Aufbewahrungsfrist?',
    options: [
      'Abnahmeprüfung: vor Betrieb durch Hersteller/Lieferant (legt Referenzwerte fest, Aufbewahrung: Betriebsdauer bzw. mind. 3 J. nach nächster) | Konstanzprüfung: monatlich durch MTR mit denselben Prüfmitteln (Aufbewahrung: 10 J.) | Sachverständigenprüfung: alle 5 Jahre durch behördlich bestimmten SV (Aufbewahrung: Betriebsdauer / 5 J. bis Wiederholung).',
      'Abnahmeprüfung: monatlich durch MTR | Konstanzprüfung: alle 5 Jahre durch den Hersteller | Sachverständigenprüfung: täglich durch den Chefarzt.',
      'Alle drei Prüfungen werden einmal jährlich vom Bundesamt für Strahlenschutz durchgeführt und 30 Jahre aufbewahrt.',
      'Bei einer Reparatur ist niemals eine Teilabnahmeprüfung nötig.'
    ],
    correctIndex: 0,
    explanation: '1. Abnahmeprüfung: Durch Hersteller/Lieferant vor Inbetriebnahme (und Teilabnahme nach Reparatur/Änderung). Legt Einstellwerte für optimale Bildqualität und die Uraufnahme/Referenzaufnahme fest. Aufbewahrung: Dauer des Betriebes oder mind. 3 Jahre nach nächster Abnahmeprüfung. 2. Konstanzprüfung: Monatlich durch MTRs mit denselben Prüfmitteln wie bei der Abnahmeprüfung (Vergleich mit Bezugswerten). Aufbewahrung: 10 Jahre. 3. Sachverständigenprüfung: Alle 5 Jahre durch behördlich bestimmten SV.',
    mnemonic: 'Hersteller macht Abnahme (Uraufnahme) → MTR prüft monatlich Konstanz (10 J.) → Sachverständiger kommt alle 5 Jahre!',
    lawReference: 'StrlSchV Qualitätssicherung',
    pdfSource: 'PDF 1, S. 5–6, 13–14 & PDF 2, S. 8, 21–22',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Vergleiche Abnahmeprüfung, Konstanzprüfung und Sachverständigenprüfung (Wer? Wann? Was? Aufbewahrung?)!',
    flashcardBack: '1. Abnahmeprüfung: Hersteller/Lieferant vor Betrieb (bzw. Teilabnahme nach Reparatur); erstellt Referenzaufnahme für optimale Bildqualität; Aufbewahrung: Betriebsdauer / mind. 3 J. nach nächster.\n2. Konstanzprüfung: MTR, 1x monatlich, Vergleich mit Bezugswerten (gleiche Prüfmittel!); Aufbewahrung: 10 Jahre.\n3. Sachverständigenprüfung: Behördlich bestimmter SV, alle 5 Jahre (prüft Technik, baul. StrlSch, ODL).'
  },
  {
    id: 'q-org-5',
    deckId: 'deck-organisation',
    question: 'Wie ist die Aufgabenverteilung in der Teleradiologie (§ 14 StrlSchG) zwischen Teleradiologe, Arzt vor Ort und MTR geregelt?',
    options: [
      'Der Teleradiologe (nicht vor Ort, hat Fachkunde) stellt die rechtfertigende Indikation, ist weisungsbefugt, befundet und trägt die Verantwortung; der Arzt vor Ort (hat Kenntnisse im StrlSch) ermittelt die Patientendaten, klärt auf und berät mit dem Teleradiologen; die MTR vor Ort (hat Fachkunde) führt die Untersuchung technisch durch.',
      'Der Arzt vor Ort stellt allein mit seinen Kenntnissen die rechtfertigende Indikation, während der Teleradiologe erst am nächsten Morgen die Bilder anschaut.',
      'In der Teleradiologie wird überhaupt kein Arzt vor Ort benötigt, es reicht eine MFA mit Kenntnissen.',
      'Die MTR stellt in der Teleradiologie die rechtfertigende Indikation und unterschreibt den Befund.'
    ],
    correctIndex: 0,
    explanation: 'Teleradiologie ist der genehmigungspflichtige Sonderfall (Nacht-/Wochenend-/Notfallversorgung), bei dem der fachkundige Arzt nicht am Ort der technischen Durchführung ist: 1) Teleradiologe (extern, Fachkunde): während Untersuchung erreichbar/anwesend, stellt rechtfertigende Indikation, weisungsbefugt, befundet, Gesamtverantwortung. 2) Arzt vor Ort (Kenntnisse): vor Ort anwesend, ermittelt klinische Daten, klärt Patienten auf, berät mit Teleradiologen. 3) MTR vor Ort (Fachkunde): vor Ort anwesend, technische Durchführung.',
    mnemonic: 'Teleradiologie-Dreieck: Teleradiologe (FK, Indikation & Befund) ↔ Arzt vor Ort (Kenntnisse, Aufklärung) ↔ MTR vor Ort (FK, Technik).',
    lawReference: '§ 14 StrlSchG',
    pdfSource: 'PDF 1, S. 11 & PDF 2, S. 10, 24',
    difficulty: 'mittel',
    type: 'case',
    flashcardFront: 'Wer macht was in der Teleradiologie und welche Qualifikation (Fachkunde vs. Kenntnisse) braucht jede Person?',
    flashcardBack: '• Teleradiologe (Fachkunde, extern): Stellt rechtfertigende Indikation, ist weisungsbefugt, befundet, trägt Verantwortung.\n• Arzt vor Ort (Kenntnisse): Vor Ort anwesend, klärt Patienten auf, ermittelt Daten, berät mit Teleradiologen.\n• MTR vor Ort (Fachkunde): Vor Ort anwesend, technische Durchführung.'
  },
  {
    id: 'q-org-6',
    deckId: 'deck-organisation',
    question: 'In welchen Abständen müssen Fachkunde und Kenntnisse im Strahlenschutz aktualisiert werden und wer kann sie aus welchem Grund entziehen?',
    options: [
      'Aktualisierung alle 5 Jahre (ca. 8h Kurs); die zuständige Behörde kann sie z. B. bei Vorkommnissen oder Beratungsresistenz entziehen – zum Wiedererlangen muss man komplett von vorne anfangen!',
      'Aktualisierung alle 10 Jahre; nur der Chefarzt kann sie für 2 Wochen pausieren.',
      'Einmal erworbene Fachkunde gilt lebenslang ohne Aktualisierung.',
      'Aktualisierung jährlich; bei Entzug reicht ein kurzer Online-Multiple-Choice-Test.'
    ],
    correctIndex: 0,
    explanation: 'Sowohl Fachkunde (prakt. Nachweise ca. 1600–2000h + Kurs) als auch Kenntnisse (z. B. 90h Kurs für MFA/OTA/Ärzte) müssen alle 5 Jahre durch einen anerkannten Kurs (ca. 8h) aktualisiert werden (§ 74 StrlSchG). Die zuständige Behörde kann die Fachkunde/Kenntnisse entziehen, z. B. nach Vorkommnissen oder bei Beratungsresistenz. Man kann sie wiedererlangen, muss aber komplett von vorne beginnen.',
    mnemonic: 'Alle 5 Jahre aktualisieren! Bei Beratungsresistenz entzieht die Behörde → Neustart bei Null!',
    lawReference: '§ 74 StrlSchG',
    pdfSource: 'PDF 1, S. 7, 14 & PDF 2, S. 13, 20, 24–25',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie oft müssen Fachkunde/Kenntnisse aktualisiert werden und was passiert bei einem Entzug?',
    flashcardBack: '• Aktualisierung: Alle 5 Jahre (ca. 8h Fachaktualisierungskurs)\n• Entzug durch: Zuständige Behörde (z.B. bei Vorkommnissen / Beratungsresistenz)\n• Wiedererlangen: Möglich, aber man muss alles komplett von vorne anfangen!'
  },
  {
    id: 'q-org-7',
    deckId: 'deck-organisation',
    question: 'Was gilt nach § 84 StrlSchG für Früherkennungsuntersuchungen (Screening, z. B. Mammographie-Screening) bezüglich der rechtfertigenden Indikation?',
    options: [
      'Früherkennungsmaßnahmen zur Ermittlung nicht übertragbarer Krankheiten werden vom BfS wissenschaftlich bewertet, bedürfen einer Genehmigung, brauchen aber KEINE individuelle rechtfertigende Indikation!',
      'Beim Screening muss für jede einzelne Teilnehmerin vorab ein Teleradiologe eine Notfall-Indikation stellen.',
      'Früherkennungsuntersuchungen sind verboten, weil die Personen keine Symptome haben.',
      'Screening darf nur bei Kindern unter 14 Jahren durchgeführt werden.'
    ],
    correctIndex: 0,
    explanation: 'Laut § 84 StrlSchG (Skript 2 S. 15): Früherkennungsmaßnahmen dienen der Ermittlung nicht übertragbarer Krankheiten, müssen wissenschaftlich anerkannt sein und werden vom Bundesamt für Strahlenschutz (BfS) bewertet. Wichtig für die Prüfung: „Früherkennungsmaßnahmen brauchen KEINE individuelle rechtfertigende Indikation!“',
    mnemonic: '§ 84 Screening = Vom BfS bewertet + Genehmigungspflichtig + KEINE individuelle rechtfertigende Indikation nötig!',
    lawReference: '§ 84 StrlSchG',
    pdfSource: 'PDF 2, S. 11, 15',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Welche Besonderheit gilt bei der Früherkennung (§ 84 StrlSchG, Screening) bezüglich der rechtfertigenden Indikation?',
    flashcardBack: '• Dient der Ermittlung nicht übertragbarer Krankheiten (wissenschaftlich anerkannt, vom BfS bewertet, genehmigungspflichtig).\n• WICHTIG: Früherkennungsmaßnahmen brauchen KEINE individuelle rechtfertigende Indikation!'
  },
  {
    id: 'q-org-8',
    deckId: 'deck-organisation',
    question: 'Was muss bei einer Unterweisung im Strahlenschutz (§ 63 StrlSchV) inhaltlich besprochen werden, wann findet sie statt und wie lange werden die Aufzeichnungen aufbewahrt?',
    options: [
      'Vor dem 1. Zutritt, danach mind. 1x jährlich in verständlicher Form/Sprache; Inhalte: Arbeitsmethoden, Gefahren, Schutzmaßnahmen, StrlSch-Recht, Datenschutz & zwingend Schwangerschaft! Aufbewahrung: 5 Jahre für Personal, 1 Jahr für Begleitpersonen.',
      'Erst 6 Monate nach Arbeitsbeginn, danach alle 5 Jahre; Aufbewahrung: 30 Jahre.',
      'Nur für Ärzte verpflichtend, Schüler und Helfer brauchen keine Unterweisung.',
      'Die Unterweisung erfolgt einmalig bei der Einstellung und muss nicht dokumentiert werden.'
    ],
    correctIndex: 0,
    explanation: 'Unterwiesen werden müssen beruflich strahlenexponierte Personen sowie Personen, denen der Zutritt gestattet ist (Schüler, Azubis, Helfer) – und zwar VOR dem erstmaligen Zutritt / vor Tätigkeitsaufnahme, danach mindestens 1x jährlich. Schwangerschaft muss zwingend ein Thema sein! Aufzeichnungen über Inhalt und Zeitpunkt müssen vom Personal unterschrieben und 5 Jahre (bei Begleitpersonen/sonstigen 1 Jahr) aufbewahrt werden.',
    mnemonic: 'Unterweisung: Vor Zutritt + 1x/Jahr + Thema Schwangerschaft Pflicht! Aufbewahrung: 5 Jahre (Personal) / 1 Jahr (Begleitpersonen).',
    lawReference: '§ 63 StrlSchV',
    pdfSource: 'PDF 1, S. 8, 13–14 & PDF 2, S. 23',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wann, für wen und mit welchem Inhalt findet die Strahlenschutz-Unterweisung (§ 63 StrlSchV) statt? Wie lange aufbewahren?',
    flashcardBack: '• Wann: Vor dem 1. Zutritt, danach mind. 1x jährlich\n• Wer: Strahlenexponiertes Personal + Helfer, Schüler, Azubis\n• Inhalt: Arbeitsmethoden, Gefahren, Schutzmaßnahmen, StrlSch-Recht, Datenschutz, SCHWANGERSCHAFT muss Thema sein!\n• Aufbewahrung: Personal 5 Jahre, Begleitpersonen 1 Jahr.'
  },

  // ================= DECK 6: FREIGABE, KONTAMINATION, RADON & FRISTEN =================
  {
    id: 'q-frei-1',
    deckId: 'deck-freigabe-fristen',
    question: 'Wie unterscheiden sich „Geplante Expositionssituation“, „Notfallexpositionssituation“, „Bestehende Expositionssituation“, „Störfall“ und „Vorkommnis“?',
    options: [
      'Geplant: Medizin, alles unter Kontrolle | Notfall: unberechenbarer Zustand (z. B. AKW-Havarie) | Bestehend: nach Notfall evakuierte Gebiete oder Radon | Störfall: Betrieb muss aus Sicherheitsgründen gestoppt werden | Vorkommnis: unbeabsichtigte Exposition in einer geplanten Situation (z. B. Röntgen 2x ausgelöst, 30 J. Aufbewahrung).',
      'Ein Vorkommnis ist die Explosion eines Kernkraftwerks; ein Notfall ist ein leicht verwackeltes Röntgenbild.',
      'Bei einer bestehenden Expositionssituation weiß man vorher nichts von der Strahlung.',
      'Ein Störfall muss niemals gemeldet werden und hat keine Sicherheitsrelevanz.'
    ],
    correctIndex: 0,
    explanation: 'Wichtige Abgrenzung für das Examen: 1. Geplante Expositionssituation: Medizinische Anwendung, alles berechenbar & unter Kontrolle. 2. Vorkommnis (§ 90 StrlSchG): Unbeabsichtigte Exposition IN einer geplanten Situation (z. B. Dosisüberschreitung, 2x Röntgen ausgelöst) → unverzüglich der Behörde melden (bei bedeutsamem Vorkommnis ans BfS), 30 Jahre aufbewahren! 3. Störfall: Ereignisablauf, bei dem der Betrieb der Anlage aus sicherheitstechnischen Gründen nicht fortgeführt werden kann. 4. Notfall: Unberechenbarer, nicht geplanter Zustand (AKW-Havarie Tschernobyl, verlorene Atombombe). 5. Bestehende Expositionssituation: Besteht bereits, wenn über Kontrolle entschieden wird (z. B. evakuierte Gebiete nach Notfall mit >1 mSv/a nach § 118, oder Radon).',
    mnemonic: '2x geröntgt = Vorkommnis (in geplanter Situation, 30 J.); Anlage muss stoppen = Störfall; AKW-Unfall = Notfall; Danach/Radon = Bestehend!',
    lawReference: '§ 2, § 5, § 90, § 118 StrlSchG',
    pdfSource: 'PDF 1, S. 3–4 & PDF 2, S. 3–4, 6–7, 16',
    difficulty: 'mittel',
    type: 'case',
    flashcardFront: 'Definiere und unterscheide: Geplante, Notfall- und Bestehende Expositionssituation sowie Störfall und Vorkommnis!',
    flashcardBack: '• Geplant: Medizin, berechenbar, alles unter Kontrolle.\n• Vorkommnis: Unbeabsichtigte Exposition IN geplanter Situation (z.B. 2x Röntgen ausgelöst) → unverzüglich melden, 30 J. aufbewahren.\n• Störfall: Betrieb der Anlage kann aus Sicherheitsgründen nicht fortgeführt werden.\n• Notfall: Unberechenbarer Zustand außer Kontrolle (z.B. Tschernobyl).\n• Bestehend: Besteht bereits (z.B. Gebiet nach Notfall > 1 mSv/a, Radon).'
  },
  {
    id: 'q-frei-2',
    deckId: 'deck-freigabe-fristen',
    question: 'Welche Kriterien gelten für die „Freigabe“ radioaktiver Stoffe im Krankenhaus (Dosiskriterium, Abklingzeit, Isotopen-HWZ, Beschriftung & Vermischungsverbot)?',
    options: [
      'Dosiskriterium: max. 10 µSv/a für Einzelpersonen der Bevölkerung | Abklingzeit: mind. 10 Halbwertszeiten (Freimessung unter Berücksichtigung des doppelten Nulleffekts) | Uneingeschränkte Freigabe im KH für HWZ < 100 Tage | Gebindebeschriftung: Leitnuklid, Datum, Volumen, gemessene Aktivität | Vermischungsverbot gilt!',
      'Dosiskriterium: 10 mSv/a | Abklingzeit: 2 Halbwertszeiten | Verdünnung mit Wasser zur Erreichung des Grenzwerts ist ausdrücklich erlaubt.',
      'Freigabe gilt nur für Röntgenröhren nach dem Ausschalten des Stroms.',
      'Cäsium-137 (HWZ 30 Jahre) darf nach 10 Tagen im normalen Krankenhaus-Restmüll entsorgt werden.'
    ],
    correctIndex: 0,
    explanation: 'Freigabe ist die Entlassung radioaktiver Stoffe aus dem Strahlenschutzrecht, um sie als normalen Restmüll (Verbrennungsanlage) zu entsorgen. Voraussetzungen: 1. Dosiskriterium „10 µSv pro Jahr“ für die Bevölkerung, 2. Mindestens 10 HWZ im Abklingraum lagern (bei HWZ < 100 Tage im Krankenhaus), 3. Leitnuklid mit der längsten HWZ bestimmt die Lagerdauer, 4. Beschriftung des Gebindes: Leitnuklid, Datum, Volumen, gemessene Aktivität, 5. Vor Entsorgung nochmals unter gleichen Bedingungen freimessen (doppelter Nulleffekt), 6. Vermischungsverbot: Der Freigabewert darf NICHT durch Vermischen/Verdünnen erreicht werden!',
    mnemonic: 'Freigabe = 10 µSv/a + mind. 10 HWZ warten + HWZ < 100 Tage + Doppelter Nulleffekt + Vermischungsverbot!',
    lawReference: 'Freigabeverfahren StrlSchV',
    pdfSource: 'PDF 1, S. 11–12, 14',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Regeln gelten für das Freigabeverfahren radioaktiver Abfälle im Krankenhaus?',
    flashcardBack: '• Ziel: Klassifizierung als nicht-radioaktiver Stoff (Restmüll/Verbrennung)\n• Dosiskriterium Bevölkerung: max. 10 µSv/Jahr\n• Abklingzeit: mind. 10 HWZ (für Isotope mit HWZ < 100 d; Leitnuklid = längste HWZ)\n• Freimessung: unter Berücksichtigung des doppelten Nulleffekts\n• Beschriftung Gebinde: Leitnuklid, Datum, Volumen, gemessene Aktivität\n• Vermischungsverbot! (Cs-137 mit HWZ 30a braucht Einzelfall-Freigabe)'
  },
  {
    id: 'q-frei-3',
    deckId: 'deck-freigabe-fristen',
    question: 'Was versteht man unter „Ableitung“ radioaktiver Stoffe und wie hoch ist der Dosisgrenzwert für Einzelpersonen der Bevölkerung?',
    options: [
      'Die Abgabe flüssiger, an Schwebstoffe gebundener oder gasförmiger radioaktiver Stoffe auf hierfür vorgesehenen Wegen (z. B. Abwasser/Abluft); der Grenzwert der effektiven Dosis für die Bevölkerung beträgt 0,3 mSv/Kalenderjahr.',
      'Das Ableiten von elektrischem Strom am Röntgengerät; Grenzwert 230 Volt.',
      'Das offene Ausschütten hochradioaktiver Flüssigkeiten in den Hausmüll; Grenzwert 20 mSv/Jahr.',
      'Die Abgabe fester Bleischürzen zum Metallschrott; Grenzwert 10 µSv/Jahr.'
    ],
    correctIndex: 0,
    explanation: 'Ableitung ist die kontrollierte Abgabe flüssiger, an Schwebstoffe gebundener oder gasförmiger radioaktiver Stoffe auf vorgesehenen Wegen in die Umwelt. Der Grenzwert der effektiven Dosis durch Ableitung für Einzelpersonen der Bevölkerung liegt bei 0,3 mSv pro Kalenderjahr.',
    mnemonic: 'Freigabe = 10 µSv/a (0,01 mSv); Ableitung (flüssig/gasförmig) = 0,3 mSv/a; Bevölkerung gesamt = 1 mSv/a!',
    lawReference: 'Teil 1 StrlSchV / § 80 StrlSchG',
    pdfSource: 'PDF 1, S. 12 & PDF 2, S. 4',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Was ist „Ableitung“ im Strahlenschutz und wie hoch ist der Grenzwert für die Bevölkerung?',
    flashcardBack: '• Definition: Abgabe flüssiger, an Schwebstoffe gebundener oder gasförmiger radioaktiver Stoffe auf hierfür vorgesehenen Wegen.\n• Grenzwert Einzelperson der Bevölkerung: Deff = 0,3 mSv / Kalenderjahr.'
  },
  {
    id: 'q-frei-4',
    deckId: 'deck-freigabe-fristen',
    question: 'Welche Einheit hat die Oberflächenkontamination, warum ist die „nicht festhaftende“ Kontamination besonders gefährlich und wie lange müssen Kontaminations-Aufzeichnungen aufbewahrt werden?',
    options: [
      'Einheit: Bq/cm² (flächenbezogene Aktivität) | Nicht festhaftende Kontamination ist mechanisch (z. B. Wischtest) leicht entfernbar und birgt ein unmittelbares Risiko der Weiterverbreitung (Kontakt, Luft, Kleidung) | Aufbewahrungsfrist bei Überschreitung: mind. 10 Jahre.',
      'Einheit: Gray pro Liter | Festhaftende Kontamination verbreitet sich durch Luftzug | Aufbewahrung: 1 Jahr.',
      'Einheit: Sievert pro Meter | Nicht festhaftende Kontamination kann nicht weggewischt werden | Aufbewahrung: 3 Jahre.',
      'Oberflächenkontamination tritt nur bei ausgeschalteten Röntgenröhren auf.'
    ],
    correctIndex: 0,
    explanation: 'Die Oberflächenkontamination umfasst die nicht festhaftende, die festhaftende und die über die Oberfläche eingedrungene Aktivität und wird in Becquerel pro Quadratzentimeter (Bq/cm²) angegeben. Nicht festhaftende Kontamination lässt sich durch einen Wischtest nachweisen und stellt ein akutes Risiko dar, weil sie leicht verschleppt/weiterverbreitet werden kann (Inkorporationsgefahr!). Beim Verlassen eines Kontrollbereichs in der NUK muss mit dem Hand-Fuß-Monitor freigemessen werden. Aufzeichnungen über Überschreitungen sind mind. 10 Jahre aufzubewahren.',
    mnemonic: 'Oberflächenkontamination = Bq/cm²; Wischtest prüft nicht-festhaftende Kontamination; 10 Jahre aufbewahren!',
    lawReference: 'StrlSchV Begriffsbestimmungen Nr. 10 & 11',
    pdfSource: 'PDF 1, S. 10, 12–14 & PDF 2, S. 5',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Erkläre Oberflächenkontamination (Einheit, festhaftend vs. nicht festhaftend, Aufbewahrungsfrist)!',
    flashcardBack: '• Einheit: Flächenbezogene Aktivität in Bq/cm²\n• Umfasst: nicht festhaftende + festhaftende + eingedrungene Aktivität\n• Nicht festhaftende: Mechanisch (Wischtest) leicht entfernbar → unmittelbares Risiko der Weiterverbreitung!\n• Aufbewahrung bei Grenzüberschreitung: mind. 10 Jahre.'
  },
  {
    id: 'q-frei-5',
    deckId: 'deck-freigabe-fristen',
    question: 'Welche Regelungen gelten im Strahlenschutzgesetz (§§ 124–132) zum Schutz vor Radon-222 in Aufenthaltsräumen und an Arbeitsplätzen?',
    options: [
      'Der Referenzwert beträgt jeweils 300 Bq/m³; an Arbeitsplätzen im Erd- oder Kellergeschoss in Radonvorsorgegebieten muss innerhalb von 18 Monaten gemessen werden (Archivierung: 5 Jahre); ab voraussichtlich > 6 mSv/a greifen die Regeln des beruflichen Strahlenschutzes.',
      'Der Referenzwert beträgt 3000 Bq/m³; gemessen wird nur im 5. Obergeschoss und die Daten werden nach 2 Wochen gelöscht.',
      'Radon ist ein künstlicher Beta-Plus-Strahler, der nur in Linearbeschleunigern vorkommt.',
      'Der Referenzwert liegt bei 10 µSv/h und muss täglich vom Betriebsrat gemessen werden.'
    ],
    correctIndex: 0,
    explanation: 'Radon-222 ist ein natürliches radioaktives Edelgas (Alphastrahler). Sowohl für Aufenthaltsräume (§ 124) als auch für Arbeitsplätze in Innenräumen (§ 126, insbesondere Erd- und Kellergeschoss) beträgt der Referenzwert 300 Bq/m³. Nach Festlegung eines Gebiets müssen Arbeitsplatzmessungen innerhalb von 18 Monaten erfolgen und 5 Jahre archiviert werden. Überschreitet die abgeschätzte Dosis trotz Maßnahmen 6 mSv/a, ist der Arbeitsplatz anzumelden und es gilt der berufliche Strahlenschutz.',
    mnemonic: 'Radon-222 = 300 Bq/m³ (EG/Keller) → 18 Monate Zeit für Messung → 5 Jahre aufbewahren → ab > 6 mSv/a berufl. StrlSch!',
    lawReference: '§§ 124–132 StrlSchG',
    pdfSource: 'PDF 1, S. 13–14 & PDF 2, S. 17',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Zahlen gelten für Radon-222 an Arbeitsplätzen (§§ 124–132 StrlSchG)?',
    flashcardBack: '• Referenzwert (Aufenthaltsräume & Arbeitsplätze im EG/Keller): 300 Bq/m³\n• Messfrist nach Festlegung: innerhalb von 18 Monaten\n• Aufbewahrungsfrist der Messergebnisse: 5 Jahre\n• Schwellenwert für beruflichen Strahlenschutz: > 6 mSv/a'
  },
  {
    id: 'q-frei-6',
    deckId: 'deck-freigabe-fristen',
    question: 'Welche Farben haben Alpha-, Beta-Minus- und Beta-Plus-Strahler in der Karlsruher Nuklidkarte und wie verändern sich Ordnungszahl (Z) und Massenzahl (A) beim jeweiligen Zerfall?',
    options: [
      'Alpha = Gelb (4He-Kern: A - 4, Z - 2; z. B. Rn-222, Po-210 in Tabak) | Beta-Minus = Blau (n → p + e⁻ + Anti-ν: Z + 1, A bleibt gleich; z. B. C-14, H-3, Pb-210) | Beta-Plus = Rot (p → n + e⁺ + ν: Z - 1, A bleibt gleich)',
      'Alpha = Blau (Z + 1) | Beta-Minus = Rot (A - 4) | Beta-Plus = Grün (Z bleibt gleich)',
      'Alpha = Rot | Beta-Minus = Gelb | Beta-Plus = Blau; bei allen Zerfällen halbiert sich die Massenzahl A.',
      'Alle Strahler sind in der Nuklidkarte schwarz dargestellt und ändern ihre Ordnungszahl nicht.'
    ],
    correctIndex: 0,
    explanation: 'Laut Skript 1 (S. 14): 1. Alpha-Strahler = GELB in der Nuklidkarte (z. B. Radon-222, Polonium-210 in Tabakpflanzen über Düngemittel). Es wird ein 4He-Kern (2 Protonen + 2 Neutronen) emittiert → A verringert sich um 4, Z um 2. 2. Beta-Minus-Strahler = BLAU (z. B. C-14, Tritium H-3, Blei-210). Ein Neutron wandelt sich in ein Proton + Elektron + Antineutrino um → Ordnungszahl Z erhöht sich um 1, Massenzahl A bleibt gleich. 3. Beta-Plus-Strahler = ROT. Ein Proton wandelt sich in ein Neutron + Positron + Neutrino um → Ordnungszahl Z verringert sich um 1, Massenzahl A bleibt gleich. (Umgebungs-Gammaquellen: K-40 in Bananen/Kartoffeln, Granit/Basalt, kosmische Strahlung).',
    mnemonic: 'Nuklidkarte: Alpha = Gelb (He-Kern), Beta-Minus = Blau (n→p, Z+1), Beta-Plus = Rot (p→n, Z-1)!',
    lawReference: 'Strahlenphysik / Nuklidkarte',
    pdfSource: 'PDF 1, S. 14',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Farben in der Nuklidkarte und Kernumwandlung bei Alpha-, Beta-Minus- und Beta-Plus-Zerfall?',
    flashcardBack: '• Alpha (GELB): 2p + 2n (4He-Kern) verlässt Kern → A - 4, Z - 2 (z.B. Rn-222, Po-210 in Tabak)\n• Beta-Minus (BLAU): n → p + e⁻ + Antineutrino → Z + 1, A bleibt gleich (z.B. C-14, 3H, Pb-210)\n• Beta-Plus (ROT): p → n + Positron (e⁺) + Neutrino → Z - 1, A bleibt gleich\n• Natürl. Gamma: K-40 (Bananen, Kartoffeln), Granit/Basalt.'
  },
  {
    id: 'q-frei-7',
    deckId: 'deck-freigabe-fristen',
    question: 'Wie lauten die gesetzlichen Aufbewahrungsfristen für Patientenunterlagen (§ 85 StrlSchG) bei Röntgendiagnostik (Untersuchung Volljähriger vs. Minderjähriger) und bei Strahlentherapie (Behandlung)?',
    options: [
      'Untersuchung (Diagnostik) Volljähriger: 10 Jahre | Minderjähriger: bis zur Vollendung des 28. Lebensjahres (mind. 10 J. ab 18. LJ) | Behandlung (Strahlentherapie): 30 Jahre (Aufzeichnungen der Bildgebung selbst: 5 Jahre laut Übersicht S. 13).',
      'Sowohl Untersuchung als auch Behandlung müssen nur 2 Jahre aufbewahrt werden.',
      'Diagnostik: 30 Jahre | Strahlentherapie: 5 Jahre | Minderjährige: bis zum 18. Geburtstag.',
      'Alle Röntgenbilder werden nach der Befundung sofort gelöscht.'
    ],
    correctIndex: 0,
    explanation: 'Nach § 85 StrlSchG gilt für die Aufbewahrung von Daten und Bilddokumenten bei Anwendung am Menschen: Bei einer Behandlung (Strahlentherapie inkl. Bestrahlungsplan & -protokoll): 30 Jahre. Bei einer Untersuchung (Diagnostik): 10 Jahre bei Volljährigen; bei Minderjährigen bis zur Vollendung des 28. Lebensjahres (also 10 Jahre ab dem 18. Geburtstag). Wichtig: Der Behörde sind auf Verlangen Unterlagen vorzulegen, aber KEINE medizinischen Befunde (ärztliche Schweigepflicht!).',
    mnemonic: 'Therapie = 30 Jahre; Diagnostik = 10 Jahre (Kinder bis zum 28. Geburtstag)! Keine Befunde an die Behörde!',
    lawReference: '§ 85 StrlSchG',
    pdfSource: 'PDF 1, S. 13 & PDF 2, S. 15',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Aufbewahrungsfristen nach § 85 StrlSchG (Behandlung, Untersuchung Volljähriger, Untersuchung Minderjähriger) & Schweigepflicht-Regel?',
    flashcardBack: '• Behandlung (Strahlentherapie): 30 Jahre\n• Untersuchung (Diagnostik) Volljährige: 10 Jahre\n• Untersuchung Minderjährige: bis Vollendung des 28. Lebensjahres\n• Wichtig: Der Behörde dürfen auf Verlangen Unterlagen gezeigt werden, aber KEINE Befunde!'
  },
  {
    id: 'q-frei-8',
    deckId: 'deck-freigabe-fristen',
    question: 'Wie lange müssen die ermittelten Körperdosiswerte (Summe der beruflichen Strahlenexposition im Strahlenschutzregister / beim SSV nach § 167 StrlSchG) aufbewahrt werden?',
    options: [
      'Bis die überwachte Person das 75. Lebensjahr vollendet hat oder vollendet hätte, mindestens jedoch 30 Jahre nach Beendigung der Beschäftigung (spätestens bis zum 100. Lebensjahr).',
      'Genau 5 Jahre nach der Einstellung.',
      'Nur bis zum Renteneintritt mit 67 Jahren.',
      '10 Jahre, danach werden alle Werte im Strahlenschutzregister automatisch gelöscht.'
    ],
    correctIndex: 0,
    explanation: 'Für die Dokumentation der ermittelten beruflichen Körperdosis (Summe) gilt nach § 167 StrlSchG die längste Frist: Aufbewahrung bis zur Vollendung des 75. Lebensjahres, mindestens aber 30 Jahre nach Beendigung der jeweiligen Beschäftigung (und maximal bis zum 100. Lebensjahr). Die laufenden monatlichen OSL-Dosimeter-Auswertungen durch den SSV vor Ort werden 10 Jahre aufbewahrt (§ 76 Abs. 2).',
    mnemonic: 'Berufliche Gesamtdosis: Bis 75 Jahre alt + mind. 30 Jahre nach Job-Ende (max. 100 Jahre alt)!',
    lawReference: '§ 167 & § 76 Abs. 2 StrlSchG',
    pdfSource: 'PDF 1, S. 13 & PDF 2, S. 19, 21',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wie lange müssen die Aufzeichnungen über die berufliche Gesamtexposition (§ 167 StrlSchG) aufbewahrt werden?',
    flashcardBack: '• Bis die überwachte Person das 75. Lebensjahr vollendet hat (oder hätte),\n• mindestens jedoch 30 Jahre nach Beendigung der Beschäftigung,\n• längstens bis zur Vollendung des 100. Lebensjahres.\n(Laufende OSL-Werte beim SSV nach § 76: 10 Jahre).'
  },

  // ================= DECK 7: PRINZIPIEN DER NUKLEARMEDIZIN (BERND NEUMAIER, S. 20) =================
  {
    id: 'q-nuk-1',
    deckId: 'deck-nuk-prinzipien',
    question: 'Worin liegt der fundamentale Unterschied zwischen der nuklearmedizinischen Diagnostik und klassischen radiologischen Röntgenverfahren?',
    options: [
      'In der Nuklearmedizin wird im Körper generierte Strahlung eines zuvor verabreichten Radiopharmakons zur Funktions- und Stoffwechseldarstellung gemessen; in der Radiologie wird die Abschwächung extern erzeugter Röntgenstrahlung für anatomische Bilder genutzt.',
      'In der Nuklearmedizin wird der Patient mit einem Röntgenlaser bestrahlt, während in der Radiologie ausschließlich Ultraschall verwendet wird.',
      'Die Nuklearmedizin liefert ausschließlich hochauflösende Knochenstrukturen, während die Radiologie Weichteilmetabolismus visualisiert.',
      'Die Radiologie nutzt offene radioaktive Stoffe, während in der Nuklearmedizin ausschließlich geschlossene Strahlenquellen Anwendung finden.'
    ],
    correctIndex: 0,
    explanation: 'Nach den Prinzipien der Nuklearmedizin (Neumaier) nutzen klassische radiologische Verfahren die gewebespezifische Absorption extern generierter Röntgenstrahlen für anatomische Bilder. Die Nuklearmedizin hingegen nutzt die im Körper generierte Strahlung eines zuvor applizierten Radiopharmakons zur Visualisierung und Quantifizierung physiologischer bzw. pathophysiologischer Prozesse (von innen nach außen).',
    mnemonic: 'Radiologie = Anatomie von außen durchleuchtet. Nuklearmedizin = Funktion & Stoffwechsel von innen heraus emittiert.',
    lawReference: 'Neumaier: Prinzipien der Nuklearmedizin, S. 20',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Grundunterschied: Nuklearmedizin vs. Radiologie?',
    flashcardBack: '• Radiologie: Anatomische Bilder durch gewebespezifische Absorption extern erzeugter Röntgenstrahlung.\n• Nuklearmedizin: Visualisierung physiologischer/metabolischer Prozesse durch im Körper generierte Strahlung eines verabreichten Radiopharmakons.'
  },
  {
    id: 'q-nuk-2',
    deckId: 'deck-nuk-prinzipien',
    question: 'Aus welchen zwei Hauptkomponenten ist ein Radiotracer (Radiopharmakon) laut dem dargestellten Schema (Abb. 1.1) aufgebaut?',
    options: [
      'Aus einem biologisch selektiven Liganden/Substrat (Carrier) und einem Radionuklid als Strahler.',
      'Aus jodiertem Röntgenkontrastmittel und einer Blei-Abschirmung.',
      'Aus einem inaktiven Trägerprotein und einem Ultraschallverstärker.',
      'Aus zwei identischen Positronen ohne Trägerstoff.'
    ],
    correctIndex: 0,
    explanation: 'Gemäß Abb. 1.1 entsteht ein Radiotracer durch die Verbindung eines Liganden/Substrats (welches selektiv mit einer biologischen Zielstruktur wie einem Tumor oder Rezeptor wechselwirkt) mit einem Radionuklid (welches die messbare Gamma- oder Positronenstrahlung aussendet).',
    mnemonic: 'Radiotracer = Ligand (Navigationssystem zum Tumor) + Radionuklid (Leuchtfeuer/Strahler).',
    lawReference: 'Neumaier: Abb. 1.1, S. 20',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie ist ein Radiotracer aufgebaut (Abb. 1.1)?',
    flashcardBack: 'Ligand / Substrat (tritt selektiv mit Zielgewebe/Rezeptor in Wechselwirkung)\n+\nRadionuklid (emittiert Strahlung zur Detektion oder Zerstörung)\n=\nRadiotracer (Radiopharmakon)'
  },
  {
    id: 'q-nuk-3',
    deckId: 'deck-nuk-prinzipien',
    question: 'Welches nuklearmedizinische Bildgebungsverfahren zeichnet sich laut Abb. 1.1 durch einen vollständigen, ringförmigen Detektorkranz um den Patienten aus?',
    options: [
      'PET (Positronenemissionstomografie)',
      'Planare Szintigrafie mit Gammakamera',
      'SPECT (Einzelphotonen-Emissionscomputertomografie)',
      'Konventionelles Röntgen mit Wandstativ'
    ],
    correctIndex: 0,
    explanation: 'In Abb. 1.1 ist die PET (Positronenemissionstomografie) schematisch mit einem geschlossenen Detektorring um den Patienten dargestellt, der die Vernichtungsstrahlung (511 keV Photonenpaare in 180°-Koinzidenz) erfasst. SPECT nutzt rotierende Detektorköpfe.',
    mnemonic: 'PET = Ringförmige Detektion (Ring-Gantry) für Koinzidenzmessung.',
    lawReference: 'Neumaier: Abb. 1.1, S. 20',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Detektorgeometrie besitzt die PET laut Abb. 1.1?',
    flashcardBack: 'Einen geschlossenen ringförmigen Detektorkranz um den Patienten zur Koinzidenzerfassung der Positronen-Vernichtungsstrahlung.'
  },
  {
    id: 'q-nuk-4',
    deckId: 'deck-nuk-prinzipien',
    question: 'Wofür steht das Akronym SPECT in der nuklearmedizinischen Bildgebung?',
    options: [
      'Single Photon Emission Computed Tomography (Einzelphotonen-Emissionscomputertomografie)',
      'Selective Positron Energy Count Technique',
      'Serial Photon Emission Contrast Tracking',
      'Standard Proton Electron Computed Testing'
    ],
    correctIndex: 0,
    explanation: 'SPECT steht für Single Photon Emission Computed Tomography (bzw. auf Deutsch: Einzelphotonen-Emissionscomputertomografie). Dabei rotieren Gammakameraköpfe um den Patienten, um dreidimensionale Schnittbilder der Aktivitätsverteilung zu generieren.',
    mnemonic: 'SPECT = Single Photon Emission Computed Tomography (Einzelphotonen-Schnittbild).',
    lawReference: 'Neumaier: Abb. 1.1 Legende, S. 20',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wofür steht SPECT (ausgeschrieben und übersetzt)?',
    flashcardBack: '• Single Photon Emission Computed Tomography\n• Auf Deutsch: Einzelphotonen-Emissionscomputertomografie\n(Erzeugt 3D-Schnittbilder durch rotierende Kameraköpfe).'
  },
  {
    id: 'q-nuk-5',
    deckId: 'deck-nuk-prinzipien',
    question: 'Warum kommt dem Strahlenschutz in nuklearmedizinischen Abteilungen laut Lehrbuch eine besonders hohe Bedeutung zu?',
    options: [
      'Weil mit offenen Radionukliden und Radiopharmaka umgegangen wird, wodurch besondere Risiken für Kontamination und Inkorporation bestehen.',
      'Weil in der Nuklearmedizin die stärkste kosmische Höhenstrahlung erzeugt wird.',
      'Weil Röntgenröhren in der Nuklearmedizin mit über 500 kV betrieben werden müssen.',
      'Weil die Patienten nach der Untersuchung dauerhaft im Kontrollbereich verbleiben müssen.'
    ],
    correctIndex: 0,
    explanation: 'Da radioaktive Strahlung Zellen schädigen kann und in der Nuklearmedizin mit offenen Radionukliden bzw. flüssigen/inhalativen Radiopharmaka gearbeitet wird, bestehen besondere Gefahren der Kontamination (Verschleppung) und Inkorporation (Aufnahme in den Körper). Entsprechend gelten strenge Schutzvorschriften (z.B. Heißlabor, Abklinganlage, 4 A statt 3 A).',
    mnemonic: 'Nuklearmedizin = Offene radioaktive Stoffe → Kontaminations- & Inkorporationsschutz beachten!',
    lawReference: 'Neumaier: S. 20, Abs. 1',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Warum ist Strahlenschutz in der Nuklearmedizin besonders speziell?',
    flashcardBack: 'Weil mit offenen Radionukliden gearbeitet wird. Neben externer Bestrahlung drohen Kontamination (Arbeitsflächen, Kleidung) und Inkorporation (Verschlucken, Einatmen). Daher Heißlabor, Schutzkleidung & Aktivitätskontrollen.'
  },
  {
    id: 'q-nuk-6',
    deckId: 'deck-nuk-prinzipien',
    question: 'Was versteht man unter dem in der modernen Nuklearmedizin etablierten Prinzip der „Theranostik“ (Therapie + Diagnostik)?',
    options: [
      'Dasselbe molekulare Zielmolekül wird einmal mit einem diagnostischen Strahler zur Lokalisation und einmal mit einem therapeutischen Strahler zur gezielten Zerstörung des Tumorgewebes markiert.',
      'Die ausschließliche Kombination von Physiotherapie und Röntgentherapie.',
      'Die Umwandlung von MRT-Bildern in Gamma-Strahlungsdosen.',
      'Die Behandlung von gesunden Patienten zur reinen Vorsorge ohne Indikation.'
    ],
    correctIndex: 0,
    explanation: 'Theranostik verbindet Therapie und Diagnostik: Ein tumorspezifischer Ligand wird z.B. mit Gallium-68 markiert, um im PET/CT den Tumor und Metastasen präzise aufzuspüren (Diagnose). Anschließend wird exakt derselbe Ligand mit einem Betastrahler (z.B. Lutetium-177) gekoppelt, um den Tumor von innen heraus gezielt zu bestrahlen und zu zerstören.',
    mnemonic: 'Theranostik = Seeing what you treat, and treating what you see (Diagnose + Therapie auf molekularer Ebene).',
    lawReference: 'Neumaier: S. 20, Abs. 1 & 2',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Was bedeutet Theranostik in der Nuklearmedizin?',
    flashcardBack: 'Kombination aus Diagnostik & Therapie: Ein spezifisches Trägermolekül wird mit einem diagnostischen Radionuklid (z.B. Ga-68) zur Bildgebung gekoppelt und bei Befund mit einem therapeutischen Nuklid (z.B. Lu-177) zur gezielten Gewebezerstörung eingesetzt.'
  },
  {
    id: 'q-nuk-7',
    deckId: 'deck-nuk-prinzipien',
    question: 'Welche zwei bedeutenden klinischen Meilensteine moderner spezifischer Radiopharmaka werden im Einführungstext explizit genannt?',
    options: [
      'Radiopharmaka zur Behandlung des Prostatakarzinoms und zur Erkennung von Proteinablagerungen in der Demenzforschung.',
      'Ausschließlich Röntgenkontrastmittel für die Herzkatheter-Untersuchung.',
      'Die Entwicklung von Bleiwesten für Mammographie-Screenings.',
      'Mittel zur Behandlung von Knochenbrüchen bei Jugendlichen.'
    ],
    correctIndex: 0,
    explanation: 'Im Text (Neumaier S. 20) werden als herausragende Meilensteine der letzten Jahre genannt: Radiopharmaka für die Behandlung von Prostatakarzinomen (z.B. PSMA-Liganden) sowie zur Erkennung von Proteinablagerungen in der Demenzforschung (z.B. Amyloid-PET).',
    mnemonic: 'Klinische Meilensteine: 1. Prostatakarzinom (PSMA-Therapie) & 2. Demenz (Amyloid-PET).',
    lawReference: 'Neumaier: S. 20, Abs. 2',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Welche klinischen Meilensteine der Radiopharmaka nennt Neumaier?',
    flashcardBack: '1. Behandlung von Prostatakarzinomen (z.B. PSMA-Liganden in Diagnostik & Radioligandentherapie)\n2. Erkennung von Proteinablagerungen in der Demenzforschung (Amyloid-/Tau-PET).'
  },
  {
    id: 'q-nuk-8',
    deckId: 'deck-nuk-prinzipien',
    question: 'Was geschieht mit der vom Patienten emittierten Gammastrahlung in der nuklearmedizinischen Bildgebung (Abb. 1.1)?',
    options: [
      'Sie wird von externen Detektoren erfasst und computergestützt rekonstruiert, um Ort, Stoffwechselaktivität und räumliche Ausdehnung des Zielgewebes nichtinvasiv zu bestimmen.',
      'Sie wird durch eine externe Röntgenröhre wieder zurück in den Körper reflektiert.',
      'Sie wird im Körper komplett absorbiert, sodass von außen nichts gemessen werden kann.',
      'Sie wird ausschließlich im Urin gesammelt und erst im Labor gemessen.'
    ],
    correctIndex: 0,
    explanation: 'Nach der Verteilung und selektiven Anreicherung des Radiotracers im Zielgewebe (z.B. Tumor) emittiert dieser Strahlung (z.B. Gammastrahlung). Externe Detektoren erfassen diese Strahlung, woraus rechnerisch die räumliche Ausdehnung und Stoffwechselaktivität rekonstruiert wird (Abb. 1.1).',
    mnemonic: 'Emittierte Strahlung von innen → Externe Detektion → 2D/3D-Rekonstruktion des Stoffwechsels.',
    lawReference: 'Neumaier: Abb. 1.1, S. 20',
    pdfSource: 'Neumaier S. 20',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Wie entsteht aus der emittierten Strahlung ein nuklearmedizinisches Bild?',
    flashcardBack: 'Der angereicherte Radiotracer sendet Strahlung aus dem Körperinneren aus. Externe Detektoren (Gammakamera, SPECT-Köpfe, PET-Ring) erfassen die Photonen und rekonstruieren computergestützt die exakte Aktivitätsverteilung im Raum.'
  }
]

export const MATCHING_PAIRS: MatchingPair[] = [
  // Fristen
  { id: 'm-f1', category: 'fristen', left: 'Unterweisungsunterlagen (Personal)', right: '5 Jahre aufbewahren (1x jährlich auffrischen)', hint: '§ 63 StrlSchV' },
  { id: 'm-f2', category: 'fristen', left: 'Unterweisungsunterlagen (Begleitpersonen)', right: '1 Jahr aufbewahren', hint: 'Tabelle PDF 1, S. 13' },
  { id: 'm-f3', category: 'fristen', left: 'Konstanzprüfung & Messgeräte-Wartung', right: '10 Jahre aufbewahren (Prüfung monatlich durch MTR)', hint: '§ 90 / QS' },
  { id: 'm-f4', category: 'fristen', left: 'Vorkommnis & Strahlentherapie (Behandlung)', right: '30 Jahre aufbewahren', hint: '§ 85 / § 90 StrlSchG' },
  { id: 'm-f5', category: 'fristen', left: 'Untersuchungsdaten (Diagnostik Volljährige)', right: '10 Jahre aufbewahren (Minderjährige bis 28. LJ)', hint: '§ 85 StrlSchG' },
  { id: 'm-f6', category: 'fristen', left: 'Berufliche Gesamtexposition (Körperdosis)', right: 'Bis 75. LJ, mind. 30 J. nach Beschäftigungsende (max. 100. LJ)', hint: '§ 167 StrlSchG' },
  { id: 'm-f7', category: 'fristen', left: 'Abnahmeprüfung', right: 'Dauer des Betriebs (oder mind. 3 J. nach nächster Abnahmeprüfung)', hint: 'Herstellerprüfung' },
  { id: 'm-f8', category: 'fristen', left: 'Fachkunde, Kenntnisse, SV-Prüfung & Führungszeugnis', right: 'Alle 5 Jahre aktualisieren bzw. wiederholen', hint: '5-Jahres-Regel' },

  // Grenzwerte
  { id: 'm-g1', category: 'grenzwerte', left: 'Berufslebensdosis (§ 77)', right: '400 mSv (danach max. 5 J. × 10 mSv/a)', hint: 'Gesamtes Berufsleben' },
  { id: 'm-g2', category: 'grenzwerte', left: 'Kategorie A (Effektive Dosis & Untersuchung)', right: '> 6 bis max. 20 mSv/a (jährliche ärztl. Untersuchung)', hint: '§ 78 StrlSchG' },
  { id: 'm-g3', category: 'grenzwerte', left: 'Kategorie B („wir“, Effektive Dosis)', right: '> 1 bis max. 6 mSv/a (UKHD: Arzt alle 3 Jahre)', hint: 'Überwachungsbereich' },
  { id: 'm-g4', category: 'grenzwerte', left: 'Augenlinsendosis (Beruflich ≥ 18 J. vs. < 18 J.)', right: '20 mSv/a (ab 18 J.) bzw. 15 mSv/a (unter 18 J. & Bevölkerung)', hint: 'Hp(3) in 3 mm Tiefe' },
  { id: 'm-g5', category: 'grenzwerte', left: 'Haut & Extremitäten (Beruflich ≥ 18 J. vs. < 18 J.)', right: '500 mSv/a (ab 18 J.) bzw. 50 mSv/a (unter 18 J. & Bevölkerung)', hint: 'Hp(0,07) Ringdosimeter' },
  { id: 'm-g6', category: 'grenzwerte', left: 'Gebärfähige Frauen (Uterus) & Ungeborenes Kind', right: 'Uterus: 2 mSv/Monat | Ungeborenes Kind: 1 mSv (ab Mitteilung bis Ende SS)', hint: '§ 78 Abs. 4 StrlSchG' },
  { id: 'm-g7', category: 'grenzwerte', left: 'Freigabe-Dosiskriterium vs. Ableitung (Bevölkerung)', right: 'Freigabe: 10 µSv/a (mind. 10 HWZ) | Ableitung: 0,3 mSv/a', hint: 'Entsorgung & Abwasser' },
  { id: 'm-g8', category: 'grenzwerte', left: 'Radon-222 Referenzwert (Aufenthaltsräume & Arbeitsplätze)', right: '300 Bq/m³ (Messung binnen 18 Monaten, 5 J. archivieren)', hint: '§§ 124–132 StrlSchG' },

  // Gewebe & Faktoren
  { id: 'm-w1', category: 'gewebe', left: 'Knochenoberfläche (KNO) & Haut', right: 'Gewebewichtungsfaktor wT = 0,01 (niedrigste Empfindlichkeit)', hint: 'Unempfindlichstes Gewebe' },
  { id: 'm-w2', category: 'gewebe', left: 'Nieren, Leber & Schilddrüse (SD)', right: 'Gewebewichtungsfaktor wT = 0,05', hint: 'Mittlere Empfindlichkeit' },
  { id: 'm-w3', category: 'gewebe', left: 'Lunge & rotes Knochenmark (KM)', right: 'Gewebewichtungsfaktor wT = 0,12', hint: 'Hohe Empfindlichkeit' },
  { id: 'm-w4', category: 'gewebe', left: 'Keimdrüsen (Gonaden)', right: 'Gewebewichtungsfaktor wT = 0,20 (höchste Empfindlichkeit)', hint: 'Empfindlichstes Gewebe' },
  { id: 'm-w5', category: 'gewebe', left: 'Photonen (Röntgen/Gamma) & Elektronen (Beta)', right: 'Strahlenwichtungsfaktor wR = 1 (Niedrig-LET)', hint: 'Locker ionisierend' },
  { id: 'm-w6', category: 'gewebe', left: 'Alpha-Strahlung & Neutronen', right: 'Alpha: wR = 20 | Neutronen: wR = 5–20 (Hoch-LET)', hint: 'Dicht ionisierend' },

  // Strahlenschutzbereiche
  { id: 'm-b1', category: 'bereiche', left: 'Allgemeines Staatsgebiet / Betriebsgelände', right: 'Deff ≤ 1 mSv/a | ODL ≤ 0,5 µSv/h', hint: 'Einzelperson der Bevölkerung' },
  { id: 'm-b2', category: 'bereiche', left: 'Überwachungsbereich (z. B. Schaltraum / Schaltpult)', right: 'Deff > 1 bis ≤ 6 mSv/a | ODL > 0,5 bis ≤ 3 µSv/h | Haut > 50 mSv/a', hint: 'Da sitzen wir!' },
  { id: 'm-b3', category: 'bereiche', left: 'Kontrollbereich (z. B. Heißlabor NUK, Röntgenraum an)', right: 'Deff > 6 bis 20 mSv/a | ODL > 3 µSv/h bis ≤ 3 mSv/h | Haut > 150 mSv/a', hint: 'Abgrenzen & kennzeichnen!' },
  { id: 'm-b4', category: 'bereiche', left: 'Sperrbereich (z. B. LB-Raum während Bestrahlung)', right: 'ODL > 3 mSv/h („Sperrbereich – kein Zutritt“)', hint: 'Teil des Kontrollbereichs' }
]
