import type { StudyDeck, Question } from '../types'

export const EXAM_DECKS: StudyDeck[] = [
  {
    id: 'deck-exam-diagnostik',
    folderId: 'examen',
    title: 'Examen Fall 1: Radiologische Diagnostik, CT & Angio',
    description: 'Original-Prüfungsfall: Fremdkörper-Lokalisation (Fr. Schreyer), Einstellparameter, MRCP, Buscopan, Metallartefakte im CT, Kreislaufweg des KM, PTCD & Nitinol-Stent.',
    icon: 'FileText',
    color: 'cyan',
    sourceFileName: 'Examen_Faechergruppe_2_Diagnostik.pdf',
    createdAt: '2026-10-27',
    isBuiltIn: true,
    summaryPoints: [
      'Fremdkörper-Ausschluss (Fr. Schreyer): Abdomen p.a. zur Lokalisation im GI-Trakt (Bohraufsatz im Colon ascendens).',
      'Parameter Röntgengerät: kV (Röhrenspannung), mAs (Röhrenstrom × Zeit), Messkammerauswahl, Fokusgröße, Filterung (Aluminium).',
      'Ionisationskammer: Luft-/Gas-Kammer zwischen 2 Kondensatorplatten (Anode +, Kathode -); Röntgenstrahlung erzeugt Elektronen/Ionen → Stromfluss steuert Abschaltung.',
      'Streustrahlenraster: Zwischen Tisch/Patient und Detektor. Absorbiert bis 88% Streustrahlung & 40% Nutzstrahlung zur Kontrastoptimierung.',
      'Magen-Darm-Passage: Mundhöhle → Oropharynx → Laryngopharynx → Ösophagus → Gaster → Duodenum → Jejunum → Ileum → Caecum (mit Appendix) → Colon ascendens, transversum, descendens → Sigma → Rektum → Anus.',
      'MRCP: Nicht-invasive T2-Darstellung von Gallen- & Pankreasgängen. Vorbereitung: 4–6 h nüchtern (Gallenblasenfüllung, Vermeidung störender Peristaltik/Darmgas).',
      'Buscopan: Spasmolytikum auf glatte Muskulatur (Minderung von Peristaltik/Bewegungsunschärfe). Kontraindikationen: Engwinkelglaukom, Prostatahyperplasie, Tachyarrhythmien.',
      'PAT (Parallel Acquisition Technique / GRAPPA): Mehrkanal-Arrayspulen sparen Phasenkodierschritte → Kürzere Scanzeit (aber Einfaltungsartefakte & SNR-Verlust).',
      'SAR-Wert (Spezifische Absorptionsrate in W/kg): Gewebeerwärmung durch HF-Energie; abhängig von Feldstärke, HF-Pulsfrequenz, Spulentyp, Patientengewicht/-größe.',
      'Fall Hr. Brodbeck (HCC & Niereninsuffizienz): Kreatinin 2,1 mg/dl, GFR 35 ml/min → Prähydration, minimales KM-Volumen; TSH normal; Bilirubin 5,3 mg/dl bestätigt Indikation zur PTCD.',
      'KM-Weg von linker Ellenbeuge zur Aorta abdominalis: V. brachialis sin. → V. axillaris → V. subclavia sin. → V. brachiocephalica sin. → V. cava superior → rechtes Herz → Lungenkreislauf → linkes Herz → Aorta ascendens → Arcus → Aorta descendens → Aorta abdominalis.',
      'Metallartefakte im CT: 140 kV (härtere Strahlung gegen Aufhärtung), dünne Kollimation/Schichten; rekonstruktiv: Iterative Rekonstruktion (IR), MAR-Algorithmen, Dual Energy Monoenergetic.',
      'PTCD & DSA: Perkutane transhepatische Cholangiodrainage (internalisiert/externalisiert). DSA = Leerbild (Maske) subtrahiert vom KM-Bild → reine Gefäßdarstellung. Nitinol-Stent mit Formgedächtnis (0,035" Draht 170cm passt, 5F Schleuse zu eng für 8,5F Katheter!).',
      'Strahlenschutz Katheterlabor: 3 A (Abstand, Abschirmung durch Tischlamellen/Bleiglas, Aufenthaltsdauer via gepulster Durchleuchtung); Untertischröhre wegen Streustrahlung.'
    ]
  },
  {
    id: 'deck-exam-strahlentherapie',
    folderId: 'examen',
    title: 'Examen Fall 2: Strahlentherapie & Bestrahlungsplanung',
    description: 'Original-Prüfungsfall: Linac-Frühcheck & Doppelmonitorsystem, Notfallbestrahlung BWK 10, DIBH bei Mamma-Ca, Halbfeldtechnik, Zielvolumen-Isodosen & VMAT vs. 3D.',
    icon: 'Crosshair',
    color: 'rose',
    sourceFileName: 'Examen_Faechergruppe_2_Strahlentherapie.pdf',
    createdAt: '2026-10-27',
    isBuiltIn: true,
    summaryPoints: [
      'Frühcheck am Linearbeschleuniger: 200 MU vorgegeben, LB stoppt erst bei 288 MU → Doppelmonitorsystem defekt (2 unabhängige Ionisationskammern zur Dosisüberwachung in MU).',
      'Elektronenbestrahlung: Zusätzlicher Tubus / Applikator zur Kollimierung (Elektronen streuen stark an Luft) und Streufolie zur homogenen Aufweitung des Dosisprofils.',
      'Fall Hr. Kinkel (Knochenmetastase BWK 10): Notfallbestrahlung bei akuter Rückenmarkskompression; aufgesetztes Stehfeld von p.a.; Lagerung RL mit Wingstep & Kniekissen; FHA 100 cm.',
      'Konventionelle Dosisberechnung: Dosierungstiefe, Technik (isozentrisch vs. aufgesetzt), Strahlenart & Energie, Feldgröße, Feldanzahl.',
      'Referenzpunkt vs. Zielpunkt: Referenzpunkt wird am BPL-CT auf der Haut markiert (zur Laserübertragung & Zielpunktverschiebung); Zielpunkt liegt im Tumorzentrum (PTV) zur Dosisplanung.',
      'Fall Fr. Salter (Mamma-Ca links): DIBH (Deep Inspiration Breath Hold) vergrößert Abstand zwischen Thoraxwand und Myokard → signifikante Schonung von Herz & Koronararterien (LAD).',
      'Tumorbett-Boost: Dosisaufsättigung im Tumorbett zur Senkung der Lokalrezidivrate; sequentiell (nach Hauptserie) oder simultan-integriert (SIB während VMAT/IMRT).',
      'Halbfeldtechnik: Zentralstrahl liegt auf der Feldgrenze (keine Strahldivergenz in Tiefe) → schützt Lunge & Herz vor Mitbestrahlung und verhindert Überlappungshotspots.',
      'Zielvolumen-Isodosen: PTV von 95–100% Referenzisodose umschlossen, steiler Dosisabfall nach außen zum Schutz von Harnblase, Rektum und Femurköpfen.',
      'VMAT vs. 3D-Stehfelder: VMAT bietet höchste Konformität & Risikoorganschonung, hat aber ein größeres Niedrigdosisbad im gesunden Gewebe und erfordert tägliche IGRT-Bildkontrollen.'
    ]
  },
  {
    id: 'deck-exam-nuklearmedizin',
    folderId: 'examen',
    title: 'Examen Fall 3: Nuklearmedizin & Radiopharmakologie',
    description: 'Original-Prüfungsfall: Kollimator-Physik (HR vs. HS), 99mTc-MIBI Radiochemie, Wächter-LK bei Melanom (Nanocoll), Transplantatniere & Lungenembolie (V/Q-Scan).',
    icon: 'Atom',
    color: 'purple',
    sourceFileName: 'Examen_Faechergruppe_2_Nuklearmedizin.pdf',
    createdAt: '2026-10-27',
    isBuiltIn: true,
    summaryPoints: [
      'Kollimator-Typen: High-Resolution (HR) = lange Septen, kleine Bohrungen für statische Aufnahmen; High-Sensitivity (HS) = kurze Septen, große Bohrungen für dynamische Funktionsstudien.',
      'Ortsauflösung (FWHM): Minimaler Abstand zweier unterscheidbarer Punktquellen. Steigt mit längeren Septen, kleineren Löchern und minimalem Detektorabstand zum Patienten.',
      'Kollimator-Qualitätskontrolle: Extrinsische Homogenitätsprüfung mit aufgesetztem Kollimator unter Verwendung einer Co-57-Flächenquelle (Flood-Quelle).',
      '99mTc-MIBI Radiochemie: Pertechnetat Tc(VII) wird durch SnCl2 auf Tc(IV/V) reduziert; Na-Citrat bildet Intermediärkomplex; Erhitzen auf 100°C bewirkt Ligandentausch mit MIBI. Sauerstoffausschluss lebenswichtig!',
      'Malignes Melanom (Fall Hr. Schuster): Sentinel-Lymph-Node (SLN) Szintigraphie mit 99mTc-Nanocoll; 4 subkutane Quaddeln um den Tumor (3, 6, 9, 12 Uhr); niemals intratumoral!',
      'Lymphsystem: Offenes Drainagesystem mit Klappen; Anreicherungsphase ca. 15 min; statische Aufnahmen mit Bleiabdeckung & Spritzenkontur; intraoperative Ortung mit Gammasonde.',
      'Transplantatniere (Fall Fr. Koch): Gute Hydrierung (10 ml/kg KG), Blasenentleerung vorab, mind. 3 Tage kein Röntgen-KM (Gefahr von Tubulusnekrosen), Stillpause 48h.',
      'Transplantatnieren-Szintigraphie: Detektor von ventral (da Beckenlage in Fossa iliaca); RVL-Aufnahmen; Lasix nur nach ärztlicher Rücksprache; keine Clearance mangels Referenzwerten.',
      'Lungenembolie-Diagnostik: Ventilation mit 81m-Krypton (HWZ 13s, permanente Inhalation, kein SPECT) vs. Perfusion mit 99mTc-MAA (Mikroembolisierung von 1:10.000 Lungenkapillaren).',
      'V/Q-Mismatch: Normale Ventilation bei segmentalem Perfusionsausfall beweist das Vorliegen einer akuten Lungenembolie.'
    ]
  },
  {
    id: 'deck-exam-strahlenschutz',
    folderId: 'examen',
    title: 'Examen Fall 4: Dosimetrie, Messtechnik & Strahlenschutz',
    description: 'Original-Prüfungsfall: Die 3 Säulen des StrlSchG, LNT vs. Hormesis, Freigabeverfahren (10 µSv), HWSD-Versuch (Am-241), Einheiten, Teleradiologie & Berthold LB 122.',
    icon: 'Shield',
    color: 'amber',
    sourceFileName: 'Examen_Faechergruppe_2_Strahlenschutz.pdf',
    createdAt: '2026-10-27',
    isBuiltIn: true,
    summaryPoints: [
      '3 Säulen des Strahlenschutzes: 1. Rechtfertigung (Nutzen > Risiko), 2. Optimierung (ALARA-Prinzip), 3. Dosisbegrenzung (Grenzwerte einhalten).',
      'LNT-Modell (Linear No-Threshold): Jede noch so kleine Dosis birgt proportionales stochastisches Risiko ohne Schwellenwert. Hormesis postuliert gegenteilig positive Reparaturstimulation bei Niedrigdosen.',
      'Freigabeverfahren (§ 31 ff. StrlSchV): Uneingeschränkte Freigabe, spezifische Freigabe, Freigabe im Einzelfall; Dosiskriterium: 10 µSv/Jahr für Einzelpersonen der Bevölkerung. Klinik-Abfalllagerung (HWZ < 100d) vs. AKW Biblis Rückbau.',
      'HWSD-Bestimmung (Am-241 bei 60 keV): Messung Nulleffekt → Leerwert vor Bleiburg → Absorberreihe im Strahlengang → Halblogarithmenpapier → Dicke bei halber Zählrate = HWSD.',
      'Einflussfaktoren auf Schwächung: Dicke des Materials, Dichte (ρ), Ordnungszahl (Z, Photoeffekt ~ Z³) und Photonenenergie (E).',
      'Begriffe: Grenzwert = gesetzlich verbindlich (20 mSv/a beruflich); Richtwert = Orientierungsgröße für Planung; Referenzwert (DRW) = Dosisleitwert für Standarduntersuchungen (§ 125).',
      'Einheiten: Energiedosis Gray (Gy), Äquivalent-/Effektive Dosis Sievert (Sv), Aktivität Becquerel (Bq), Dosisflächenprodukt cGy·cm² / µGy·m².',
      'Teleradiologie: Vor Ort erforderlich: Arzt mit erforderlichen Kenntnissen im Strahlenschutz + MTR mit Fachkunde im Strahlenschutz.',
      'Berthold LB 122 Proportionalzählrohr: Großflächen-Zählkammer mit Unterdruck, Mylar-Eintrittsfolie mit Schutzgitter. Folienriss führt zum Lufteintritt → Zählausfall! Prüfung mit Sr-90 Prüfstrahler (104 IPS ±10%).'
    ]
  }
]

export const EXAM_QUESTIONS: Question[] = [
  // ================= TEIL 1: RADIOLOGISCHE DIAGNOSTIK, CT & ANGIO =================
  {
    id: 'q-ex-d1',
    deckId: 'deck-exam-diagnostik',
    question: 'Frau Schreyer hat beim Zahnarzt einen Bohraufsatz verschluckt (2 Stunden her). Welche Röntgenuntersuchung ist im Klinikum primär indiziert?',
    options: [
      'Abdomenleeraufnahme (p.a.) zur Lokalisation des Fremdkörpers im Magen-Darm-Trakt',
      'Schädelübersicht in zwei Ebenen zum Ausschluss von Zahnwurzelverletzungen',
      'CT des Beckens mit rektaler Kontrastmitteleinlauf-Untersuchung',
      'Ausschließlich eine MRT des Schädels zur neurologischen Abklärung'
    ],
    correctIndex: 0,
    explanation: 'Nach 2 Stunden befindet sich der verschluckte Fremdkörper typischerweise bereits im Magen-Darm-Trakt. Eine Abdomen-Übersichtsaufnahme (p.a.) dient der sicheren Lokalisation und Verlaufsbeurteilung. Die p.a.-Projektion schont zudem die Gonaden gegenüber der a.p.-Projektion.',
    mnemonic: 'Verschluckter Fremdkörper nach Stunden → Abdomen p.a. (Magen-Darm-Passage).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 1a',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Welche Röntgenaufnahme wird bei Verdacht auf verschluckten Fremdkörper (nach 2 Stunden) angefertigt?',
    flashcardBack: 'Abdomen (p.a.) zur Lokalisation des Fremdkörpers im Magen-Darm-Trakt.'
  },
  {
    id: 'q-ex-d2',
    deckId: 'deck-exam-diagnostik',
    question: 'Welche Parameter müssen am Röntgengerät vor der Aufnahme eingestellt bzw. kontrolliert werden?',
    options: [
      'Röhrenspannung (kV), Röhrenstrom-Zeit-Produkt (mAs), gewünschte Messkammer, Fokusgröße und Vorfilterung (z.B. Aluminium/Kupfer)',
      'Ausschließlich die Rotationsgeschwindigkeit der Drehanode in U/min',
      'Nur die Belichtungszeit in Sekunden ohne Spannungsanpassung',
      'Die T1- und T2-Relaxationszeiten der Bucky-Einheit'
    ],
    correctIndex: 0,
    explanation: 'Am Schaltpult müssen Röhrenspannung (kV für die Strahlenqualität/den Bildkontrast), das mAs-Produkt (für die Dosis/Photonenmenge), die aktive Ionisationsmesskammer der Belichtungsautomatik, der Fokus (Klein-/Großfokus) sowie die Filterung kontrolliert werden.',
    mnemonic: 'Die 5 Einstell-Säulen: kV, mAs, Messkammer, Fokus, Vorfilter.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 1b',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Welche Parameter stellen Sie am Röntgengerät ein und kontrollieren Sie vor Auslösung?',
    flashcardBack: '1. Röhrenspannung (kV)\n2. mAs (Röhrenstrom × Zeit)\n3. Gewünschte Messkammer (Belichtungsautomatik)\n4. Fokusgröße (Klein-/Großfokus)\n5. Filter / Aluminiumvorfilterung'
  },
  {
    id: 'q-ex-d3',
    deckId: 'deck-exam-diagnostik',
    question: 'Wie ist eine Ionisationskammer (Belichtungsautomatik) aufgebaut und nach welchem Prinzip funktioniert sie?',
    options: [
      'Sie besteht aus einer gasgefüllten Kammer zwischen zwei Kondensatorplatten; Röntgenstrahlung ionisiert Gasatome, Elektronen wandern zur Anode (+), der resultierende Strom schaltet die Belichtung ab.',
      'Sie besteht aus einem rotierenden Quecksilberfaden, der durch thermische Ausdehnung den Stromkreis mechanisch trennt.',
      'Sie wandelt Röntgenstrahlung direkt in sichtbares Laserlicht um, welches über Glasfasern reflektiert wird.',
      'Sie misst die Dosis über die Erwärmung eines massiven Bleiblocks im Strahlengang.'
    ],
    correctIndex: 0,
    explanation: 'Eine Ionisationskammer besitzt zwei geladene Elektroden (Anode +, Kathode -) und ein Füllgas. Durchtretende Röntgenstrahlung ionisiert Atome; freie Elektronen driften zur Anode, Ionen zur Kathode. Der gemessene Ionisationsstrom ist proportional zur Dosis am Detektor und beendet die Belichtung bei Erreichen des Sollwerts.',
    mnemonic: 'Röntgenstrahl ionisiert Gas → Ladungstrennung zur Anode/Kathode → Stromfluss schaltet Generator ab.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 1c',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wie ist die Ionisationskammer aufgebaut und wie funktioniert sie?',
    flashcardBack: '• Aufbau: Luft- oder gasgefüllte Kammer mit 2 Kondensatorplatten (Anode + / Kathode -).\n• Funktion: Einfallende Röntgenstrahlung ionisiert Gasatome. Freie Elektronen wandern zur Anode, Ionen zur Kathode → messbarer elektrischer Strom schaltet die Belichtung bei Erreichen der Solldosis ab.'
  },
  {
    id: 'q-ex-d4',
    deckId: 'deck-exam-diagnostik',
    question: 'Wo genau befindet sich das Streustrahlenraster und welche physikalische Funktion erfüllt es?',
    options: [
      'Hinter dem Tisch/Patienten und vor dem Detektor; es absorbiert bis zu 88% der Streustrahlung zur Kontrastoptimierung (schluckt aber auch bis zu 40% Nutzstrahlung).',
      'Direkt im Strahlenaustrittsfenster der Röntgenröhre zur Reduktion weicher Strahlung.',
      'Hinter dem Bildempfänger zum Schutz des Untersuchers vor Durchstrahlung.',
      'Auf der Haut des Patienten als Ersatz für Bleischürzen.'
    ],
    correctIndex: 0,
    explanation: 'Das Streustrahlenraster steht zwischen Patient (dem Streukörper) und Bildempfänger. Durch ausgerichtete Bleilamellen lässt es überwiegend Primärstrahlung passieren und fängt schräg einfallende Compton-Streustrahlung ab (bis 88%). Dadurch steigt der Bildkontrast deutlich, allerdings erfordert der Absorptionsverlust von ca. 40% Nutzstrahlung eine Dosisanpassung.',
    mnemonic: 'Position: Hinterm Tisch, vor dem Detektor. Aufgabe: Streustrahlen fressen, Kontrast schärfen.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 2a-b',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Position und Funktion des Streustrahlenrasters?',
    flashcardBack: '• Position: Hinter dem Buckytisch/Patienten und vor dem Detektor.\n• Funktion: Kontrastoptimierung durch Absorption von bis zu 88% der störenden Streustrahlung (absorbiert allerdings auch ca. 40% der Nutzstrahlung).'
  },
  {
    id: 'q-ex-d5',
    deckId: 'deck-exam-diagnostik',
    question: 'Welche weiteren Möglichkeiten haben Sie in der Praxis, um Streustrahlung effektiv zu minimieren?',
    options: [
      'Einblenden des Nutzstrahlenbündels auf die interessierende Region sowie Bleiabdeckung nicht benötigter Areale',
      'Vollständiges Öffnen der Tiefenblende und Erhöhung des Abstands zur Decke',
      'Verwendung eines unbeschichteten Holzbretts statt einer Bleiblende',
      'Ausschließliche Verdopplung der Röhrenspannung (kV) ohne Feldbegrenzung'
    ],
    correctIndex: 0,
    explanation: 'Streustrahlung entsteht im bestrahlten Patientenvolumen. Je kleiner das bestrahlte Feld (exakte Kollimation/Einblendung) und je besser Randbereiche abgeschirmt werden (Bleiabdeckung, Bleigummiunterlagen), desto weniger Streuphotonen entstehen und treffen den Detektor oder Untersucher.',
    mnemonic: 'Einblenden = bester Streustrahlenschutz für Patient & Bildqualität!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 2c',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Zwei Möglichkeiten zur Reduzierung von Streustrahlung am Patienten?',
    flashcardBack: '1. Enges Einblenden des Nutzstrahlenbündels auf das Zielgebiet.\n2. Verwenden von Bleiabdeckungen angrenzender Körperpartien.'
  },
  {
    id: 'q-ex-d6',
    deckId: 'deck-exam-diagnostik',
    question: 'Welchen Weg nimmt der verschluckte Bohraufsatz von der Mundhöhle bis zum After in korrekter Reihenfolge mit lateinischen Fachbegriffen?',
    options: [
      'Mundhöhle → Oropharynx → Laryngopharynx → Ösophagus → Gaster → Duodenum → Jejunum → Ileum → Caecum (mit Appendix) → Colon ascendens, transversum, descendens → Sigma → Rektum → Anus',
      'Mundhöhle → Trachea → Ösophagus → Gaster → Ileum → Jejunum → Duodenum → Colon descendens → Anus',
      'Mundhöhle → Larynx → Duodenum → Gaster → Caecum → Jejunum → Ileum → Colon transversum → Rektum',
      'Mundhöhle → Pharynx → Gaster → Colon sigmoideum → Duodenum → Caecum → Anus'
    ],
    correctIndex: 0,
    explanation: 'Der physiologische gastrointestinale Passage-Weg lautet: Mundhöhle → Oropharynx → Laryngopharynx → Ösophagus → Magen (Gaster) → Zwölffingerdarm (Duodenum) → Leerdarm (Jejunum) → Krummdarm (Ileum) → Blinddarm (Caecum mit Appendix vermiformis) → Dickdarm (Colon ascendens, transversum, descendens) → Sigmoid (Colon sigmoideum) → Mastdarm (Rektum) → After (Anus).',
    mnemonic: 'Magen → DJ Ilse (Duodenum, Jejunum, Ileum) → Caecum → Colon (auf, quer, ab) → Sigma → Rektum → Anus.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 3',
    pdfSource: 'Examen Fächergruppe 2, S. 1',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Nennen Sie die Stationen des GI-Trakts von Mundhöhle bis After in lateinischen Fachbegriffen.',
    flashcardBack: 'Mundhöhle → Oropharynx → Laryngopharynx → Ösophagus → Gaster → Duodenum → Jejunum → Ileum → Caecum mit Appendix vermiformis → Colon (ascendens, transversum, descendens) → Sigma (Colon sigmoideum) → Rektum → Anus.'
  },
  {
    id: 'q-ex-d7',
    deckId: 'deck-exam-diagnostik',
    question: 'Frau Schreyer soll wegen Koliken eine MRCP erhalten. Warum muss sie 4–6 Stunden nüchtern sein?',
    options: [
      'Eine leere Gallenblase kontrahiert bei Nahrungsaufnahme und störendes Darmgas/Flüssigkeit überlagert die T2-Darstellung der Gallen- und Pankreasgänge.',
      'Weil das MRT-Signal bei vollem Magen ein lebensgefährliches Quenching auslöst.',
      'Damit oral verabreichtes Bariumsulfat im Magen kristallisiert.',
      'Um den Blutdruck künstlich auf unter 90 mmHg systolisch zu senken.'
    ],
    correctIndex: 0,
    explanation: 'Die MRCP nutzt stark T2-gewichtete Sequenzen, in denen stehende Flüssigkeiten (Galle, Pankreassaft) hyperintens leuchten. Nahrungsaufnahme führt zur Cholezystokinin-Ausschüttung (Gallenblase kontrahiert und entleert sich) und erzeugt Magen-Darm-Peristaltik sowie Gasüberlagerungen, was die Bildqualität massiv verschlechtert.',
    mnemonic: 'MRCP: 4–6h nüchtern = volle Gallenblase & ruhiger Darm.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 5b',
    pdfSource: 'Examen Fächergruppe 2, S. 2',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Vorbereitung für MRCP und physiologische Begründung?',
    flashcardBack: '• 4–6 Stunden nüchtern sein.\n• Begründung: Nahrungsaufnahme kontrahiert die Gallenblase (weniger Flüssigkeit sichtbar); zudem reduzieren weniger Darmgas und Mageninhalt störende Überlagerungen und Bewegungsunschärfen.'
  },
  {
    id: 'q-ex-d8',
    deckId: 'deck-exam-diagnostik',
    question: 'Welches Medikament wird zur Ruhigstellung des Darms in der abdominellen MRT verabreicht und welche Kontraindikationen bestehen?',
    options: [
      'Buscopan (Butylscopolamin); wirkt spasmolytisch auf glatte Muskulatur; Kontraindikationen: Engwinkelglaukom, Prostatahyperplasie mit Restharn, Tachyarrhythmien.',
      'Heparin; wirkt gerinnungshemmend; Kontraindikationen: Hypertonie und Asthma.',
      'Metoclopramid (MCP); regt die Peristaltik maximal an; Kontraindikationen: Diabetes.',
      'Paracetamol; wirkt analgetisch; Kontraindikationen: Nierenzysten.'
    ],
    correctIndex: 0,
    explanation: 'Buscopan (Parasympatholytikum) entspannt die glatte Darmmuskulatur, hemmt die Peristaltik und verhindert dadurch Bewegungsartefakte in der MRT. Typische anticholinerge Kontraindikationen sind Glaukom (Gefahr des akuten Glaukomanfalls durch Mydriasis), Prostatahyperplasie (Harnverhalt) und tachykarde Herzrhythmusstörungen.',
    mnemonic: 'Buscopan = Darmruhe. Cave: Auge (Glaukom), Blase (Prostata), Herz (Tachykardie).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 6a-c',
    pdfSource: 'Examen Fächergruppe 2, S. 2',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Buscopan in der MRT: Wirkung und 3 Kontraindikationen?',
    flashcardBack: '• Wirkung: Spasmolytisch (entkrampfend) auf die glatte Muskulatur zur Minderung von Darmperistaltik und Bewegungsunschärfe.\n• Kontraindikationen: 1. Prostatahyperplasie, 2. Glaukom (Grüner Star), 3. Tachykarde Herzrhythmusstörungen.'
  },
  {
    id: 'q-ex-d9',
    deckId: 'deck-exam-diagnostik',
    question: 'Wie funktioniert die parallele Bildgebung (PAT / GRAPPA) in der MRT und welcher physikalische Kompromiss entsteht?',
    options: [
      'Mehrere Spulenelemente (Array-Spulen) mit unterschiedlicher räumlicher Sensitivität erfassen Signale simultan, wodurch Phasenkodierschritte eingespart werden; die Messzeit sinkt, aber das Signal-zu-Rausch-Verhältnis (SNR) nimmt ab.',
      'Zwei MRT-Geräte messen denselben Patienten gleichzeitig von Kopf und Fuß her.',
      'Die Gradientenspulen werden abgeschaltet und durch optische Kameras ersetzt.',
      'Die Bildzeit verdoppelt sich, um die vierfache Schärfe zu erzielen.'
    ],
    correctIndex: 0,
    explanation: 'PAT (Parallel Acquisition Technique) nutzt die ortsabhängige Empfindlichkeit von Mehrkanal-Spulen. Dadurch kann der k-Raum unterabgetastet werden (jede 2. oder 3. Zeile wird ausgelassen). Die Messzeit sinkt proportional zum Beschleunigungsfaktor, jedoch führt dies zu Einfaltungsartefakten (die rechnerisch entfaltet werden) und einem reduzierten Signal-Rausch-Verhältnis (SNR).',
    mnemonic: 'PAT / GRAPPA: Mehrere Spulen sparen k-Raum-Zeilen → Scan viel schneller, aber weniger SNR.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 7a',
    pdfSource: 'Examen Fächergruppe 2, S. 2–3',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Prinzip und Vor-/Nachteile der parallelen Bildgebung (PAT) im MRT?',
    flashcardBack: '• Prinzip: Gleichzeitige Nutzung mehrerer Array-Oberflächenspulen mit bekannter Sensitivität zur Einsparung von Phasenkodierschritten (Unterabtastung des k-Raums).\n• Vorteil: Drastische Verminderung der Akquisitionszeit.\n• Nachteil: Geringeres Signal-Rausch-Verhältnis (SNR) & potenzielle Einfaltungsartefakte.'
  },
  {
    id: 'q-ex-d10',
    deckId: 'deck-exam-diagnostik',
    question: 'Wofür steht die Abkürzung SAR in der MRT, welche Maßeinheit hat dieser Wert und wovon hängt er ab?',
    options: [
      'Spezifische Absorptionsrate [W/kg]; Maß für die HF-induzierte Gewebeerwärmung; abhängig von Feldstärke, Pulsfrequenz/HF-Leistung, Spulenart, Patientengewicht und -größe.',
      'Signal-Artefakt-Relation [dB]; Maß für Bildrauschen; abhängig von Raumtemperatur.',
      'Standard-Absorptions-Radius [mm]; Abstand der Spule zum Patienten.',
      'Sequenz-Akquisitions-Rate [Bilder/s]; Bildwiederholrate des Monitors.'
    ],
    correctIndex: 0,
    explanation: 'SAR (Specific Absorption Rate) beziffert die pro Kilogramm Körpergewicht absorbierte Hochfrequenzenergie in Watt pro Kilogramm [W/kg]. Sie führt zu einer potenziell schädlichen Erwärmung des Körpergewebes. Die Grenzwerte (z.B. Normal Operating Mode max. 2 W/kg Ganzkörper) werden vom Scanner anhand von Patientengewicht, Sequenztyp (z.B. viele 180°-Refokussierungspulse bei TSE) und Feldstärke überwacht.',
    mnemonic: 'SAR = W/kg = Wie stark heizt das MRT den Patienten auf?',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 9',
    pdfSource: 'Examen Fächergruppe 2, S. 3',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'SAR-Wert in der MRT: Bedeutung, Einheit und Einflussfaktoren?',
    flashcardBack: '• Bedeutung: Spezifische Absorptionsrate = Maß für die Absorption elektromagnetischer HF-Felder im Gewebe (Gewebeerwärmung!).\n• Einheit: Watt pro Kilogramm (W/kg).\n• Abhängig von: Magnetfeldstärke (B0), Pulsfrequenz/HF-Energie, Art der Sendespule, Körpergröße und Patientengewicht.'
  },
  {
    id: 'q-ex-d11',
    deckId: 'deck-exam-diagnostik',
    question: 'Fall Herr Brodbeck (61 J., HCC): Welche Blutwerte vor der kontrastmittelverstärkten CT sind kritisch und wie ist vorzugehen?',
    options: [
      'GFR 35 ml/min und Kreatinin 2,1 mg/dl zeigen eine Niereninsuffizienz an (erhöhtes CIN-Risiko ➔ Prähydration, minimales KM-Volumen); Bilirubin 5,3 mg/dl bestätigt Gallestau.',
      'TSH ist lebensbedrohlich verändert und erfordert sofortige Schilddrüsenresektion.',
      'Hämoglobin von 15 g/dl verbietet jede Kontrastmittelgabe wegen Viskositätserhöhung.',
      'Die aPTT von 45s schließt eine CT-Untersuchung grundsätzlich aus.'
    ],
    correctIndex: 0,
    explanation: 'Vor jodhaltigem KM müssen Nierenfunktion (Kreatinin, eGFR) und Schilddrüse (TSH) vorliegen. Bei eGFR 35 ml/min und Krea 2,1 mg/dl liegt eine relevante Nierenfunktionseinschränkung vor. Nach strenger Indikationsstellung durch den Radiologen muss hydriert werden (i.v. NaCl vor und nach CT), das KM-Volumen minimiert und nephrotoxische Medikamente pausiert werden. Bilirubin 5,3 mg/dl belegt den Cholestase-Verdacht für die geplante PTCD.',
    mnemonic: 'CT-KM-Check: Niere (Krea/eGFR) & Schilddrüse (TSH). Ab GFR < 45 ml/min: Hydratation!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 11a',
    pdfSource: 'Examen Fächergruppe 2, S. 4',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Relevante Laborwerte vor KM-CT bei Nierenpatienten und Schutzmaßnahmen?',
    flashcardBack: '• Relevante Werte: eGFR (GFR < 35–45 ml/min) und Kreatinin (z.B. 2,1 mg/dl) = Nierenfunktionsstörung; TSH (Schilddrüse).\n• Vorgehen: Strenge Nutzen-Risiko-Abwägung durch Radiologen, Prähydration (oral/i.v.), geringstmögliches KM-Volumen verwenden, poststationäre Kontrolle.'
  },
  {
    id: 'q-ex-d12',
    deckId: 'deck-exam-diagnostik',
    question: 'Welchen anatomischen Gefäßweg nimmt ein Kontrastmittelbolus von der linken Ellenbeuge (V. brachialis) bis zur Aorta abdominalis?',
    options: [
      'V. brachialis sin. → V. axillaris → V. subclavia sin. → V. brachiocephalica sin. → V. cava sup. → rechter Vorhof → rechter Ventrikel → Truncus pulmonalis → Lungenstrombahn → Vv. pulmonales → linker Vorhof → linker Ventrikel → Aorta ascendens → Arcus aortae → Aorta descendens → Aorta abdominalis',
      'V. brachialis sin. → V. jugularis interna → A. carotis → V. cava inferior → Aorta abdominalis',
      'V. brachialis sin. → V. azygos → Pfortader → Lebervenen → Aorta abdominalis',
      'V. brachialis sin. → A. subclavia → Truncus coeliacus → Aorta abdominalis'
    ],
    correctIndex: 0,
    explanation: 'Venöser Rückstrom aus linkem Arm: V. brachialis sinistra → V. axillaris → V. subclavia sin. → V. brachiocephalica sin. (mündet mit der rechten in die V. cava superior). Von dort ins rechte Herz (Vorhof → Ventrikel), über den Truncus pulmonalis in die Lunge, über 4 Vv. pulmonales sauerstoffreich ins linke Herz (Vorhof → Ventrikel) und über die Aorta (ascendens → Arcus → descendens thoracica → abdominalis) in den Bauchraum.',
    mnemonic: 'Armvene → V. cava sup. → Rechtes Herz → Lunge → Linkes Herz → Aorta.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 11c',
    pdfSource: 'Examen Fächergruppe 2, S. 4',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Gefäßweg eines KM-Bolus von V. brachialis links bis Aorta abdominalis?',
    flashcardBack: 'V. brachialis (links) → V. axillaris → V. subclavia sinistra → V. brachiocephalica sinistra → V. cava superior → rechter Vorhof → rechter Ventrikel → Truncus pulmonalis → Aa. pulmonales → Lunge → Vv. pulmonales → linker Vorhof → linker Ventrikel → Aorta ascendens → Arcus aortae → Aorta descendens → Aorta abdominalis.'
  },
  {
    id: 'q-ex-d13',
    deckId: 'deck-exam-diagnostik',
    question: 'Wie können Metallartefakte im CT sowohl aufnahmetechnisch als auch bei der Rekonstruktion unterdrückt werden?',
    options: [
      'Technisch: Erhöhung der kV-Zahl (z.B. 140 kV für härtere Strahlung/weniger Aufhärtung) & dünne Kollimation; Rekonstruktiv: Iterative Rekonstruktion (IR), MAR-Algorithmen und Virtual Monoenergetic Rekonstruktionen (Dual Energy).',
      'Technisch: Absenkung der kV auf 70 kV; Rekonstruktiv: Ausschalten aller Bildfilter.',
      'Technisch: Weite Kollimation über 20 mm; Rekonstruktiv: Rein analoge Bildentwicklung.',
      'Metallartefakte können im CT physikalisch weder technisch noch rechnerisch beeinflusst werden.'
    ],
    correctIndex: 0,
    explanation: 'Metall absorbiert weiche Photonen komplett (Photon starvation & Strahlaufhärtung). Technisch durchdringen hochenergetische Photonen (140 kV) das Metall besser, dünne Schichten mindern Partialvolumeneffekte. Rekonstruktiv ersetzen Metal Artifact Reduction (MAR) Algorithmen überstrahlte Rohdatenwerte und Dual-Energy-CT errechnet virtuelle monoenergetische Hochenergie-Bilder (z.B. 120–140 keV).',
    mnemonic: 'Metall-Abhilfe: 140 kV (harte Strahlung) + dünne Schichten + MAR / Iterative Rekonstruktion.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 11d',
    pdfSource: 'Examen Fächergruppe 2, S. 5',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Maßnahmen gegen Metallartefakte im CT (technisch & rekonstruktiv)?',
    flashcardBack: '• Technisch: Erhöhung der kV-Zahl (z.B. 140 kV → härtere Strahlung, weniger Aufhärtung), dünne Schichten/Kollimation.\n• Rekonstruktiv: Iterative Rekonstruktion (IR), MAR-Algorithmen (Metal Artifact Reduction), Dual-Energy-CT mit hoch-monoenergetischen Rekonstruktionen.'
  },
  {
    id: 'q-ex-d14',
    deckId: 'deck-exam-diagnostik',
    question: 'Herr Brodbeck erhält in der Angio eine PTCD mit Nitinol-Stent. Welche Eigenschaft hat Nitinol und warum passt eine liegende 5F-Schleuse nicht?',
    options: [
      'Nitinol ist eine Formgedächtnis-Legierung (selbstexpandierend bei Körperwärme); die 5F-Schleuse ist zu eng, da das Stenteinführsystem einen Außendurchmesser von 8,5F besitzt (Schleusenwechsel nötig).',
      'Nitinol ist ein Kunststoffschlauch, der sich im Gallensaft auflöst; 5F ist viel zu weit.',
      'Nitinol muss manuell mit einer Zange aufgebogen werden; Schleusen spielen keine Rolle.',
      'Nitinol darf nur über eine 12F-Schleuse in der Vena cava implantiert werden.'
    ],
    correctIndex: 0,
    explanation: 'Nitinol (Nickel-Titan) ist superelastisch und besitzt ein thermisches Formgedächtnis: Im Katheter komprimiert, entfaltet sich der Stent nach Zurückziehen der Hülle selbstständig bei Körpertemperatur. Das Verpackungslabel verlangt für das 8,5F Stentsystem eine Schleuse mit mind. 8,5F Innendurchmesser – eine liegende 5F-Schleuse (Innen-Ø ca. 1,67 mm) ist viel zu eng (8,5F ≈ 2,8 mm) und muss gewechselt werden!',
    mnemonic: 'Nitinol = Memory-Metall (selbstexpandierend). 1 French = 1/3 mm → 8,5F passt nie durch 5F!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 12c-d',
    pdfSource: 'Examen Fächergruppe 2, S. 6',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Eigenschaften eines Nitinol-Stents und Schleusen-Kompatibilität?',
    flashcardBack: '• Nitinol: Selbstexpandierende Formgedächtnis-Legierung (Scherengitterstruktur expandiert bei Körperwärme nach Zurückziehen der Transporthülle).\n• Kompatibilität: 0,035" Draht passt; liegende 5F-Schleuse passt NICHT für ein 8,5F Stentsystem (muss gegen ≥ 8,5F gewechselt werden).'
  },

  // ================= TEIL 2: STRAHLENTHERAPIE & BESTRAHLUNGSPLANUNG =================
  {
    id: 'q-ex-st1',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Frühcheck am Linearbeschleuniger: Bei 200 MU Vorgabe stoppt das Gerät erst bei 288 MU. Welches Bauteil ist defekt und welche Funktionen hat es?',
    options: [
      'Doppelmonitorsystem (2 unabhängige Transmissions-Ionisationskammern); Funktionen: Exakte Dosisabschaltung nach Erreichen der Monitor-Einheiten (MU) und kontinuierliche Überwachung der Strahlsymmetrie/Dosisleistung.',
      'Der Klystron-Modulator zur HF-Erzeugung.',
      'Der Kollimatorkopf-Antriebsmotor für die x-Backen.',
      'Der optische Entfernungsanzeiger (ODI) an der Decke.'
    ],
    correctIndex: 0,
    explanation: 'Im Kopf des Linearbeschleunigers misst das Doppelmonitorsystem (zwei in Serie geschaltete, hermetisch dichte Ionisationskammern) unabhängig voneinander die deponierte Dosis in Monitor Units (MU). Schaltet Kammer 1 bei 200 MU nicht ab, greift Kammer 2 als redundante Sicherheitsabschaltung (hier bei 288 MU). Eine Abweichung von 88 MU erfordert die sofortige Sperrung des Geräts!',
    mnemonic: 'Doppelmonitorsystem: 2 Kammern = Dosisabschaltung (MU) + Strahlsymmetrie-Check.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 13a',
    pdfSource: 'Examen Fächergruppe 2, S. 8',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welches Bauteil überwacht die Dosis am Linac und stoppt bei Erreichen der Monitoreinheiten?',
    flashcardBack: 'Das Doppelmonitorsystem:\n1. Besteht aus 2 voneinander unabhängigen Ionisationskammern.\n2. Aufgaben: Strahlabschaltung bei Erreichen der Soll-Monitoreinheiten (MU), Zeitabschaltung & permanente Kontrolle der Strahlsymmetrie.'
  },
  {
    id: 'q-ex-st2',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Welche speziellen Bauteile werden am Linac für die Bestrahlung mit Elektronen verwendet, die bei Photonen NICHT benötigt werden?',
    options: [
      'Elektronentubus / Applikator (zur Feldeingrenzung nah an der Haut, da Elektronen stark an Luft streuen) und Streufolie (zur homogenen Aufweitung des Elektronenstrahls).',
      'Target (Wolframanode) und Ausgleichskörper (Flattening Filter).',
      'Multileaf-Kollimator (MLC) und Portal-Imaging-Detektor.',
      'Bleiabschirmwände im Patiententisch.'
    ],
    correctIndex: 0,
    explanation: 'Bei Photonen schlägt der Elektronenstrahl auf ein Target (Bremsstrahlung) und wird durch den Flattening Filter geformt. Bei Elektronenbestrahlung fährt das Target heraus. Um den nadelartigen Strahl aufzuweiten, wird eine Streufolie eingeschwenkt. Da Elektronen durch Wechselwirkung mit Luftteilchen stark streuen, muss ein hautnah positionierter Tubus (Applikator) das Feld kollimieren.',
    mnemonic: 'Elektronen brauchen: Streufolie (im Kopf) + Tubus (nah am Patienten wegen Luftstreuung).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 13b',
    pdfSource: 'Examen Fächergruppe 2, S. 8',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Spezifische Bauteile für Elektronenbestrahlung am Linearbeschleuniger?',
    flashcardBack: '1. Tubus (Applikator): Kollimierung der Elektronen nah am Patienten zur Erzielung scharfer Feldgrenzen (verhindert Aufstreuung an Luftteilchen).\n2. Streufolie: Weitet den fokussierten Elektronenstrahl zu einer homogenen Dosisfläche auf.'
  },
  {
    id: 'q-ex-st3',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Fall Herr Kinkel (75 J., Knochenmetastase BWK 10, akute Rückenmarkskompression): Welche Technik und Lagerung eignet sich zur Notfallbestrahlung?',
    options: [
      'Aufgesetztes Stehfeld von dorsal (p.a.); Lagerung in Rückenlage mit Wingstep (Arme nach oben) und indexiertem Kniekissen; Feldzentrierung auf BWK 10 (FHA 100 cm).',
      'Mehrfeld-IMRT im Stehen ohne Fixationshilfen.',
      'Ganzkörper-Brachytherapie in Bauchlage.',
      'Stereotaktische Einzeit-Radiochirurgie ohne Vorab-CT.'
    ],
    correctIndex: 0,
    explanation: 'Bei einer akuten Rückenmarkskompression droht eine Querschnittlähmung – schnelles Handeln ist lebenswichtig! Das aufgesetzte dorsale Stehfeld (p.a.) lässt sich ohne zeitaufwendigen 3D-Plan direkt am Gerät einstellen. Der Patient liegt stabil in Rückenlage, Arme im Wingstep, Beine auf indexierter Knierolle.',
    mnemonic: 'Notfall Rückenmarkskompression: Schnell p.a.-Stehfeld aufsetzen, Lähmung verhindern!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 14a-b',
    pdfSource: 'Examen Fächergruppe 2, S. 8',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Bestrahlungstechnik und Lagerung bei Notfallbestrahlung einer BWK-Metastase?',
    flashcardBack: '• Technik: Aufgesetztes Stehfeld von p.a. (dorsal).\n• Lagerung: Rückenlage (RL), Wingstep (Arme hoch), indexiertes Kniekissen.\n• Einstellung: Feld zentriert auf BWK 10, Ausrichtung über Hautmarkierungen/Lasersystem (FHA 100 cm).'
  },
  {
    id: 'q-ex-st4',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Welche vier Angaben werden zwingend benötigt, um eine konventionelle Dosisberechnung für ein Bestrahlungsfeld durchzuführen?',
    options: [
      'Dosierungstiefe, Bestrahlungstechnik (isozentrisch vs. aufgesetzt/FHA), Strahlenart & Energie, Feldgröße und Anzahl der Felder.',
      'Körpergewicht, Nüchternzeit, Blutgruppe und Pulsfrequenz.',
      'Röhrenstrom in mA, Belichtungszeit in ms und Filterdicke.',
      'Magnetfeldstärke in Tesla, Flipwinkel und TE/TR-Zeiten.'
    ],
    correctIndex: 0,
    explanation: 'Für die Dosisberechnung am Linac (Ermittlung der Monitor Units MU) benötigt man: 1. Tiefe des Dosisbezugspunkts im Gewebe (z.B. 5 cm), 2. Technik (isozentrisch FHA=100cm zum Tumor vs. aufgesetzt FHA=100cm zur Haut), 3. Photonen- oder Elektronenenergie (z.B. 6 MV vs. 15 MV), 4. Feldgröße (z.B. 10 × 10 cm²) und Feldanzahl.',
    mnemonic: 'Dosisberechnung: Tiefe + Technik (Iso/Aufgesetzt) + Energie + Feldgröße.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 14c',
    pdfSource: 'Examen Fächergruppe 2, S. 8',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Welche Angaben sind für eine konventionelle Dosisberechnung nötig?',
    flashcardBack: '1. Dosierungstiefe (cm im Gewebe)\n2. Technik (isozentrisch vs. aufgesetzt)\n3. Strahlenart & Energie (z.B. 6 MV Photonen)\n4. Feldgröße und Anzahl der Felder'
  },
  {
    id: 'q-ex-st5',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Was unterscheidet den Referenzpunkt vom Zielpunkt bei der Bestrahlungsplanung im BPL-CT?',
    options: [
      'Der Referenzpunkt wird am BPL-CT auf der Haut des Patienten markiert (Laserabgleich & Zielpunktverschiebung); der Zielpunkt liegt im Inneren des Tumors (PTV) und dient der Dosisverschreibung.',
      'Der Referenzpunkt bestimmt die Ausbreitung von Streustrahlung im Raum.',
      'Beide Punkte müssen exakt auf dem gleichen Wirbelkörper liegen.',
      'Der Zielpunkt wird ausschließlich vom Medizinphysik-Experten ohne Arzt festgelegt.'
    ],
    correctIndex: 0,
    explanation: 'Der Referenzpunkt dient als geometrischer Ausgangspunkt: Er wird während des Planungs-CTs per Laser markiert und tätowiert. Der Zielpunkt (Isozentrum) wird vom Radioonkologen im dreidimensionalen Tumorvolumen (GTV/CTV/PTV) festgelegt. Die Koordinatendifferenz zwischen Referenz- und Zielpunkt (Couch-Verschiebung x, y, z) wird am Bestrahlungsgerät eingestellt.',
    mnemonic: 'Referenzpunkt = Haut/Laser-Startmarke. Zielpunkt = Im Tumorzentrum (hierhin wird verschoben).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 14d',
    pdfSource: 'Examen Fächergruppe 2, S. 8–9',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Unterschied zwischen Referenzpunkt und Zielpunkt im BPL-CT?',
    flashcardBack: '• Referenzpunkt: Wird am BPL-CT festgelegt und auf der Patientenhaut markiert; dient der reproduzierbaren Lagerung und Zielpunktverschiebung am Gerät.\n• Zielpunkt: Vom Arzt festgelegter Punkt im Zentrum des Zielvolumens (Tumor/PTV), auf den die verordnete Strahlendosis berechnet wird.'
  },
  {
    id: 'q-ex-st6',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Frau Salter (48 J., Mamma-Ca links): Welches Prinzip verfolgt die DIBH-Technik (Deep Inspiration Breath Hold)?',
    options: [
      'Durch Bestrahlung in tiefer Einatmung dehnt sich die Lunge aus, der Brustkorb hebt sich und vergrößert den Abstand zwischen Brustdrüse und Herz, wodurch das Myokard/LAD aus dem Strahlenfeld wandert.',
      'Die Patientin hält die Luft an, damit keine Atemgeräusche die Audiokommunikation stören.',
      'Die Dosis wird bei Einatmung automatisch verdoppelt, um die Haut zu schonen.',
      'DIBH wird ausschließlich bei Bestrahlungen des Kleinhirns angewendet.'
    ],
    correctIndex: 0,
    explanation: 'Bei linksseitigem Mammakarzinom liegt das Herz (insbesondere der R. interventricularis anterior / LAD) unmittelbar hinter der Brustwand im Einstrahlbereich tangentialer Felder. In tiefer Inspiration (DIBH) vergrößert das Lungenvolumen den Abstand zwischen Thoraxwand und Vorderwand des Herzens um bis zu mehrere Zentimeter ➔ drastische Senkung kardialer Spätfolgen!',
    mnemonic: 'DIBH (Deep Inspiration): Luft anhalten → Herz senkt sich nach dorsal weg von der Brust!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 15a',
    pdfSource: 'Examen Fächergruppe 2, S. 9',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Hintergrund und Bezeichnung der DIBH-Technik bei Mamma-Ca links?',
    flashcardBack: '• DIBH = Deep Inspiration Breath Hold (Atemanhaltetechnik in tiefer Einatmung).\n• Hintergrund: Durch die tiefe Einatmung hebt sich der Brustkorb und die Lunge füllt sich. Dadurch vergrößert sich der Abstand zwischen Brust und Herz, sodass das Herz aus dem Bestrahlungsfeld geschoben wird.'
  },
  {
    id: 'q-ex-st7',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Was versteht man unter einem „Tumorbett-Boost“ bei Mammakarzinom und welche Applikationsformen gibt es?',
    options: [
      'Dosisaufsättigung im ursprünglichen Tumorbett zur Senkung der Lokalrezidivrate; entweder sequentiell (nach Abschluss der Gesamtmammabestrahlung) oder simultan-integriert (SIB während IMRT/VMAT).',
      'Eine zusätzliche Hormoninfusion im Bestrahlungsraum.',
      'Ein Stoßwellen-Verfahren zur Erweichung des Narbengewebes.',
      'Die sofortige Bestrahlung der kontralateralen gesunden Brust.'
    ],
    correctIndex: 0,
    explanation: 'Das Tumorbett (ehemaliger Tumorsitz) trägt das höchste Risiko für ein Wiederauftreten des Tumors (Lokalrezidiv). Ein Boost bringt zusätzliche Dosis (z.B. 10–16 Gy) gezielt in dieses Areal ein. Dies geschieht entweder sequentiell (nach z.B. 50 Gy Ganzbrustbestrahlung) oder als SIB (Simultan Integrierter Boost), bei dem das Tumorbett in jeder Fraktion eine höhere Einzeldosis erhält als das restliche Brustgewebe.',
    mnemonic: 'Boost = Extra-Dosis ins Tumorbett gegen Rezidive (sequentiell danach oder simultan SIB).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 15b-c',
    pdfSource: 'Examen Fächergruppe 2, S. 9',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Was ist ein Mamma-Boost und wie kann er durchgeführt werden?',
    flashcardBack: '• Definition: Dosisaufsättigung im Tumorbett zur Verringerung der Lokalrezidivrate.\n• Durchführung:\n1. Sequentieller Boost: Zusätzliche Stehfelder nach Abschluss der Hauptbestrahlung.\n2. Simultan-integrierter Boost (SIB): Höhere Fraktionsdosis im Tumorbett zeitgleich mit der Ganzbrustbestrahlung (z.B. per VMAT/IMRT).'
  },
  {
    id: 'q-ex-st8',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Welche Besonderheit hat die Halbfeldtechnik bei tangentialer Mamma-Bestrahlung und warum ist sie von zentraler Bedeutung?',
    options: [
      'Eine Feldkante liegt exakt auf der Zentralstrahlachse (keine Strahldivergenz an dieser Kante); dadurch wird ein Überstrahlen divergenter Strahlen in Lunge, Herz und Nachbarfelder verhindert.',
      'Die Bestrahlung dauert nur die halbe Zeit und spart Strom.',
      'Es wird nur die halbe Dosis gegeben, um Haarausfall zu vermeiden.',
      'Der Strahl wird in der Mitte durch eine Betonmauer geteilt.'
    ],
    correctIndex: 0,
    explanation: 'Bei normalen symmetrischen Feldern divergieren die Strahlen nach außen kegelförmig. Bei tangentialer Mamma-Bestrahlung würde ein divergenter Rand tief in Lunge und Herz strahlen. Wird das Feld asymmetrisch geschlossen, sodass der Zentralstrahl (der als einziger strahlenphysikalisch absolut gerade verläuft) die dorsale Feldgrenze bildet, gibt es dort keinerlei Divergenz nach innen!',
    mnemonic: 'Halbfeldtechnik: Zentralstrahl bildet Feldkante → KEINE Divergenz in Lunge und Herz!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 15d',
    pdfSource: 'Examen Fächergruppe 2, S. 9–10',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Besonderheit und Vorteil der Halbfeldtechnik bei Mamma-Ca?',
    flashcardBack: '• Besonderheit: Eine Feldkante liegt exakt auf der Zentralachse (Isocenterachse) → an dieser Kante gibt es keine Strahldivergenz.\n• Bedeutung: Tangentiale Felder schneiden ohne Divergenz an der Thoraxwand ab. Tiefer liegende Risikoorgane (Lunge, Herz) werden optimal geschont, Überlappungen und Inhomogenitäten entfallen.'
  },
  {
    id: 'q-ex-st9',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Welche Kriterien kennzeichnen eine konforme Dosisverteilung im PTV und welche Risikoorgane sind bei einer Beckenbestrahlung (z.B. Zervix/Rektum) relevant?',
    options: [
      'Das PTV wird homogen von der Referenzisodose (95–100%) umschlossen mit steilem Dosisabfall nach außen; relevante Risikoorgane sind Harnblase, Rektum und Femurköpfe.',
      'Die maximale Dosis liegt im Femurkopf, um Knochenbrüche zu verhindern.',
      'Das PTV erhält nur 50% der Dosis, das gesunde Gewebe 100%.',
      'Risikoorgane im Beckenbereich existieren nicht, da Knochen unempfindlich sind.'
    ],
    correctIndex: 0,
    explanation: 'Eine konforme Bestrahlungsplanung (z.B. VMAT) passt die 95–100%-Isodose millimetergenau an die gekrümmte Form des PTV an. Außerhalb des PTV fällt die Dosis extrem steil ab. Im Becken müssen Harnblase (Spättoxizität: Zystitis), Rektum (Proktitis) und Femurköpfe (Risiko der Femurkopfnekrose) streng unterhalb ihrer Toleranzdosen gehalten werden.',
    mnemonic: 'Pelvine Risikoorgane: Blase + Rektum + Femurköpfe (beidseits). PTV-Isodose: 95–100%.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 16a-d',
    pdfSource: 'Examen Fächergruppe 2, S. 10',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Merkmale einer konformen PTV-Dosisverteilung und Risikoorgane im Becken?',
    flashcardBack: '• Dosisverteilung: Zielvolumen (PTV) ist homogen von der Referenzisodose (95–100%) umschlossen; steiler Dosisabfall nach außen zur Organschonung.\n• Risikoorgane im Becken: 1. Harnblase, 2. Rektum, 3. Femurköpfe.'
  },
  {
    id: 'q-ex-st10',
    deckId: 'deck-exam-strahlentherapie',
    question: 'Welche Vor- und Nachteile ergeben sich beim Vergleich von 3D-Stehfeldern gegenüber VMAT (Rotationsbestrahlung)?',
    options: [
      'Stehfelder: robuste, einfache Planung/QA, aber schlechtere Risikoorganschonung & höhere Hautdosis; VMAT: hochkonforme Dosis & maximale Schonung, aber höheres Niedrigdosisvolumen im Körper & hoher QA-Aufwand.',
      'Stehfelder zerstören den Beschleunigerkopf; VMAT benötigt keinen Strom.',
      'VMAT erzeugt überhaupt keine Streustrahlung im Körper des Patienten.',
      '3D-Stehfelder können beliebige Tumore mit 100%iger Schonung der Haut erfassen.'
    ],
    correctIndex: 0,
    explanation: 'VMAT moduliert Gantryrotation, MLC-Lamellen und Dosisleistung kontinuierlich. Vorteil: Höchste Schonung konkav anliegender Risikoorgane (z.B. Schonung des Rektums bei Zervix-Ca). Nachteil: Die Strahlung wird aus 360° eingestrahlt, wodurch ein großes Volumen gesunden Gewebes eine niedrige Dosis erhält („Niedrigdosisbad“), zudem ist der Planungs-, Kontroll- (tgl. IGRT/CBCT) und QA-Aufwand deutlich höher.',
    mnemonic: 'VMAT: Perfekt an Tumor angepasst (top OAR-Schutz), aber mehr Niedrigdosis im Körper & QA-Aufwand.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 17d',
    pdfSource: 'Examen Fächergruppe 2, S. 11',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Vor- und Nachteile von VMAT vs. 3D-Stehfeldern?',
    flashcardBack: '• Stehfelder:\n+ Einfache, robuste Planung & geringer QA-Aufwand.\n- Schlechtere Schonung von Risikoorganen, höhere Hautbelastung.\n• VMAT:\n+ Höchste Dosis im PTV bei bestmöglicher Schonung der Risikoorgane.\n- Höherer Planungs- und QS-Aufwand (tgl. CBCT), größeres Niedrigdosisvolumen im gesunden Gewebe.'
  },

  // ================= TEIL 3: NUKLEARMEDIZIN & RADIOPHARMAKOLOGIE =================
  {
    id: 'q-ex-nuk1',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Worin unterscheiden sich High-Resolution (HR) und High-Sensitivity (HS) Kollimatoren an der Gammakamera und wann werden sie eingesetzt?',
    options: [
      'HR: lange Septen, kleine Bohrungen → hohe Ortsauflösung (für statische Aufnahmen); HS: kurze Septen, große Bohrungen → hohe Empfindlichkeit/Zählrate (für dynamische Sequenzen).',
      'HR wird ausschließlich für Röntgenaufnahmen verwendet, HS für MRT.',
      'HR besitzt Bleisepten, HS besteht aus reinem Kunststoff.',
      'HS erzeugt 3D-Bilder, HR kann nur 1D-Kurven darstellen.'
    ],
    correctIndex: 0,
    explanation: 'Ein Kollimator bestimmt die Abbildungseigenschaften der Gammakamera: LEHR (Low Energy High Resolution) hat lange, eng stehende Septen und kleine Löcher; dies filtert schräge Photonen rigoros heraus ➔ gestochen scharfes Bild, aber geringe Zählrate (ideal für statische Knochenszintigraphie). LEHS (Low Energy High Sensitivity) hat kürzere Septen und größere Löcher ➔ lässt viel mehr Photonen durch (wichtig für dynamische 1-Sekunden-Phasen der Nieren- oder Perfusionsequenz).',
    mnemonic: 'HR = Scharfes Bild (statisch). HS = Schnelle Zählrate (dynamisch).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 18a',
    pdfSource: 'Examen Fächergruppe 2, S. 12',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Unterschied und Einsatzbereiche von HR- vs. HS-Kollimatoren?',
    flashcardBack: '• HS (High-Sensitivity): Kurze Septen, große Bohrungen, hohe Empfindlichkeit, geringere Ortsauflösung → für dynamische Untersuchungen.\n• HR (High-Resolution): Lange Septen, kleine Bohrungen, hohe Ortsauflösung, geringere Empfindlichkeit → für statische Detailaufnahmen.'
  },
  {
    id: 'q-ex-nuk2',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Wie ist die Ortsauflösung der Gammakamera definiert und wie beeinflussen Kollimatorparameter diesen Wert?',
    options: [
      'Minimalabstand, bei dem zwei getrennte Punktquellen noch getrennt dargestellt werden können; sie steigt mit kleineren Bohrungen, längeren Septen und geringem Abstand zum Patienten.',
      'Die Zeit, die ein Szintillationskristall zum Abklingen benötigt.',
      'Die maximale Energie der detektierbaren Gammastrahlung in keV.',
      'Die Fläche des Kamerakopfes geteilt durch die Anzahl der Photomultiplier.'
    ],
    correctIndex: 0,
    explanation: 'Ortsauflösung ist das Vermögen, feine Strukturen ortsgetreu abzubilden. Quantifiziert wird sie meist als FWHM (Full Width at Half Maximum). Je kleiner der Lochdurchmesser d und je länger die Septenlänge l des Kollimators ist, desto kleiner ist der Akzeptanzwinkel und desto besser ist die Ortsauflösung. Der Abstand Patient-Kollimator muss minimal sein, da die Auflösung mit der Entfernung drastisch sinkt!',
    mnemonic: 'Gute Ortsauflösung = kleine Löcher + lange Septen + Nah am Patienten!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 18b',
    pdfSource: 'Examen Fächergruppe 2, S. 12',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Definition der Ortsauflösung und Einflussfaktoren an der Gammakamera?',
    flashcardBack: '• Definition: Minimalabstand, bei dem zwei Punktquellen noch getrennt aufgelöst werden können.\n• Einfluss: Je kleiner die Abbildung im Kristall, desto besser die Auflösung. Sie steigt mit sinkender Lochgröße, steigender Septenlänge und geringstem Abstand Detektor-Patient.'
  },
  {
    id: 'q-ex-nuk3',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Welche Qualitätskontrolle wird zur Prüfung des Kollimators an der Gammakamera durchgeführt und welches Prüfmittel wird benötigt?',
    options: [
      'Extrinsische Homogenitätsprüfung mit aufgesetztem Kollimator unter Verwendung einer Kobalt-57 (Co-57) Flächenquelle.',
      'Intrinsische Homogenitätsprüfung ohne Kollimator mit einer Punktquelle.',
      'Gantry-Rotationsprüfung mit einer Wasserwaage.',
      'Prüfung der Dosisabschaltung mit einem Bleistift-Dosimeter.'
    ],
    correctIndex: 0,
    explanation: 'Intrinsisch = Kristall + Elektronik OHNE Kollimator (mittels Punktquelle in 5× Detektordiagonale Abstand). Extrinsisch = MIT Kollimator. Um Kollimatorbeschädigungen (z.B. verbogene Septen) und Inhomogenitäten aufzudecken, wird eine Co-57-Flächenquelle (Halbwertszeit 271 d, Gamma-Energie 122 keV ähnlich Tc-99m mit 140 keV) direkt auf den Kollimator aufgelegt.',
    mnemonic: 'Extrinsisch = mit Kollimator + Co-57 Flächenquelle. Intrinsisch = nackter Kristall.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 18c',
    pdfSource: 'Examen Fächergruppe 2, S. 13',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Qualitätskontrolle des Kollimators an der Gammakamera?',
    flashcardBack: '• Prüfung: Extrinsische Homogenitätsprüfung (Systemhomogenität).\n• Prüfkörper/Phantom: Co-57-Flächenquelle (Flood-Quelle) oder mit Tc-99m gefülltes Flächenphantom.'
  },
  {
    id: 'q-ex-nuk4',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Radiochemie: Welche Reaktion läuft bei der Zubereitung von 99mTc-MIBI (Cardiolite) im Markierungsfläschchen ab?',
    options: [
      'SnCl2 reduziert das inaktive Tc(VII) auf reaktives Tc(IV/V); Na-Citrat stabilisiert einen Zwischenkomplex; Erhitzen auf 100°C führt zum Ligandentausch, bei dem MIBI den Citratplatz einnimmt.',
      'Pertechnetat wird mit flüssigem Stickstoff eingefroren und zerfällt spontan zu MIBI.',
      'MIBI bindet das Eluat direkt ohne jede Temperaturveränderung oder Reduktion.',
      'Es findet eine Kernfusion von Technetium mit Kohlenstoffatomen statt.'
    ],
    correctIndex: 0,
    explanation: 'Das Generatoreluat (99mTc-Pertechnetat) liegt in der Oxidationsstufe +7 vor und ist reaktionsträge. Zinn(II)-Chlorid (SnCl2) dient als Reduktionsmittel und reduziert Tc auf +4/+5. Im Kit ist Na-Citrat/Tartrat enthalten, das bei Raumtemperatur einen schnellen Zwischenkomplex bildet. Durch Kochen im Wasserbad bei 100°C dissoziiert der schwächere Citrat-Komplex und das lipophile MIBI bindet hochstabil (Ligandenaustausch).',
    mnemonic: 'MIBI-Kochen: SnCl2 reduziert → Na-Citrat fängt ab → 100°C Kochbad tauscht Citrat gegen MIBI!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 19a-b',
    pdfSource: 'Examen Fächergruppe 2, S. 13',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Reaktionsschritte bei der Markierung von 99mTc-MIBI?',
    flashcardBack: '1. Reduktion: Das reaktionsträge 99mTc-Pertechnetat (7-wertig) wird durch Zinn(II)-Chlorid (SnCl2) auf 4–5-wertig reduziert.\n2. Vorübergehende Komplexierung: Na-Citrat/Tartrat bindet Technetium bei Raumtemperatur zur Stabilisierung.\n3. Ligandentausch: Erhitzen auf 100°C löst das Citrat ab und MIBI bindet stabil an Technetium.'
  },
  {
    id: 'q-ex-nuk5',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Was passiert, wenn bei der Zubereitung des 99mTc-MIBI-Kits versehentlich Luftsauerstoff in das Fläschchen gelangt?',
    options: [
      'Der Sauerstoff oxidiert sofort das zweiwertige Zinn (Sn2+ → Sn4+), sodass keine Reduktion des Pertechnetats stattfindet und die Markierung fehlschlägt.',
      'Das Fläschchen zerspringt durch Überdruck.',
      'Das Technetium wandelt sich in Molybdän um.',
      'Es entsteht ein hochtoxisches Gas, das die Kammer unbrauchbar macht.'
    ],
    correctIndex: 0,
    explanation: 'Zinn(II)-Chlorid ist extrem oxidationsempfindlich. Dringt Sauerstoff in das Kit-Fläschchen ein, reagiert das Sn(II) bevorzugt mit O2 zu Sn(IV). Dadurch steht kein Reduktionsmittel mehr für das 99mTcO4- zur Verfügung. Das Technetium bleibt 7-wertig und ungebunden (freies Pertechnetat), was zu massiver Schilddrüsen- und Magenspeicherung statt Myokardanreicherung führt.',
    mnemonic: 'Sauerstoff zerstört SnCl2 → keine Reduktion → Markierung misslingt!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 19c',
    pdfSource: 'Examen Fächergruppe 2, S. 13',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Warum muss Luftsauerstoff bei der Tc-99m-Markierung vermieden werden?',
    flashcardBack: 'Weil Zinn(II)-Chlorid (SnCl2) sofort mit dem Sauerstoff oxidiert. Dadurch steht kein Reduktionsmittel mehr zur Verfügung, das Pertechnetat wird nicht reduziert und es findet keine Markierungsreaktion statt.'
  },
  {
    id: 'q-ex-nuk6',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Fall Herr Schuster (Melanom am Rücken): Welche Substanz und Injektionstechnik wird zur Wächterlymphknoten-Szintigraphie (SLNE) verwendet?',
    options: [
      '99mTc-Nanocoll; 4 subkutane Quaddeln zirkulär um das Melanom (3, 6, 9, 12 Uhr); strikte Vermeidung intratumoraler Injektionen.',
      '99mTc-DMSA; intravenöse Bolusinjektion in die Vena jugularis.',
      '18F-FDG; intramuskuläre Injektion in den Musculus gluteus medius.',
      '99mTc-Pertechnetat; perkutane Injektion direkt in das Tumorzentrum.'
    ],
    correctIndex: 0,
    explanation: 'Zur SLNE (Sentinel Lymph Node Excision) wird 99mTc-Nanocoll (Albumin-Nanokolloid, Partikelgröße < 80 nm) verwendet. Die Applikation erfolgt streng peritumoral intradermal/subkutan in 4 Depots um den Herd herum. Eine Injektion in den Tumor selbst ist strikt verboten, da dies Tumorzellen in Blut- oder Lymphbahnen verschleppen könnte (Metastasierungsgefahr!).',
    mnemonic: 'SLNE: Nanocoll subkutan um den Tumor (3, 6, 9, 12 Uhr) – niemals IN den Tumor!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 20a-c',
    pdfSource: 'Examen Fächergruppe 2, S. 13–14',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Substanz und Applikationstechnik bei der Wächterlymphknoten-Szintigraphie?',
    flashcardBack: '• Radiopharmakon: 99mTc-Nanocoll (Nanokolloid).\n• Applikation: 4 subkutane Injektionen zirkulär um das Melanom herum (bei 3, 6, 9 und 12 Uhr).\n• Cave: Keinesfalls intratumoral injizieren (Gefahr der Tumorzellverschleppung!).'
  },
  {
    id: 'q-ex-nuk7',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Welche physiologische Besonderheit des Lymphsystems gegenüber dem Blutkreislauf begründet die SLNE-Technik?',
    options: [
      'Das Lymphsystem ist ein offenes Einbahnstraßensystem (beginnt blind im Interstitium) mit Klappen; Kolloidpartikel werden in die Lymphkapillaren drainiert und im ersten Knoten (Sentinel) phagozytiert.',
      'Die Lymphe zirkuliert in einem geschlossenen Hochdruckkreislauf wie das Blut.',
      'Lymphflüssigkeit fließt ausschließlich von zentralen Organen nach peripher in die Haut.',
      'Lymphgefäße besitzen keine Klappen und münden direkt in den Magen.'
    ],
    correctIndex: 0,
    explanation: 'Das Lymphsystem ist kein geschlossener Kreislauf, sondern ein Drainagesystem: Es beginnt mit fingerförmig geschlossenen Lymphkapillaren im Gewebe und transportiert Lymphe über Klappen ein gerichtet nach zentral. Partikel definierter Größe (Nanocoll 5–80 nm) passen durch die Kapillarendothelfenster, fließen zum ersten tributären Lymphknoten (Wächterknoten) und werden dort von Makrophagen gefiltert.',
    mnemonic: 'Lymphsystem = Offene Einbahnstraße mit Klappen und biologischen Filterstationen.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 20b',
    pdfSource: 'Examen Fächergruppe 2, S. 13',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Besonderheiten des Lymphsystems gegenüber dem Blutkreislauf?',
    flashcardBack: '1. Kein geschlossener Kreislauf, sondern ein zusätzliches, offenes Gefäßsystem.\n2. Einbahnstraße von der Peripherie zum Zentrum.\n3. Beginnt blind (handschuhartig) im Gewebe.\n4. Besitzt Klappenstrukturen wie Venen.\n5. Dient als Drainagesystem mit biologischer Filter- und Abwehrfunktion (Lymphknoten).'
  },
  {
    id: 'q-ex-nuk8',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Frau Koch (38 J.): Warum darf vor einer Nierenfunktionsszintigraphie (MAG3) mind. 3 Tage kein Röntgenkontrastmittel verabreicht worden sein?',
    options: [
      'Ausscheidung jodhaltiger KM kann reversible Tubulusnekrosen verursachen, die die tubuläre Sekretion von 99mTc-MAG3 blockieren und das Ergebnis verfälschen.',
      'Weil Röntgen-KM die Gamma-Detektoren der Kamera dauerhaft magnetisiert.',
      'Weil Jod das radioaktive Technetium in Pertechnetat zurückverwandelt.',
      'Damit der Patient keine Allergie gegen das Plastik der Liege entwickelt.'
    ],
    correctIndex: 0,
    explanation: '99mTc-MAG3 wird zu ca. 90% durch aktive tubuläre Sekretion der proximalen Tubuluszellen eliminiert. Jodhaltige Röntgenkontrastmittel belasten die Tubuluszellen osmotisch und toxisch, was zu temporären Nekrosen oder Funktionsstörungen führen kann. Die MAG3-Sekretion bricht ein, was fälschlicherweise als schwerer Nierenschaden interpretiert würde.',
    mnemonic: 'MAG3 wird tubulär sezerniert! Röntgen-KM schädigt Tubulus → mind. 3 Tage Pause!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 21a',
    pdfSource: 'Examen Fächergruppe 2, S. 14',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Warum 3 Tage Abstand zwischen Röntgen-KM und 99mTc-MAG3 Nierenszintigraphie?',
    flashcardBack: 'Weil die renale Ausscheidung jodhaltiger Röntgen-KM zu reversiblen Nekrosen bzw. Funktionsstörungen der Tubuluszellen führen kann. Dadurch wird die tubuläre Sekretion von 99mTc-MAG3 behindert oder blockiert, was das Untersuchungsergebnis massiv verfälscht.'
  },
  {
    id: 'q-ex-nuk9',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Welche gerätetechnischen und protokollarischen Unterschiede bestehen bei einer Nierenszintigraphie einer Transplantatniere gegenüber Eigennieren?',
    options: [
      'Detektor von ventral (Transplantat liegt im Becken/Fossa iliaca); RVL-Aufnahmen; Lasix nur nach expliziter ärztlicher Absprache; keine Clearance-Blutentnahme mangels Referenzwerten.',
      'Kamera zwingend von dorsal auf Höhe Th12 ausgerichtet; doppelte Aktivitätsmenge.',
      'Untersuchung muss stehend auf dem Laufband erfolgen.',
      'Transplantatnieren dürfen nuklearmedizinisch niemals untersucht werden.'
    ],
    correctIndex: 0,
    explanation: 'Transplantatnieren werden heterotop in das vordere Becken (meist rechte oder linke Fossa iliaca) implantiert und an die Iliakalgefäße anastomosiert. Daher muss der Detektor von anterior/ventral messen (bei Eigennieren von posterior/dorsal). Lasix (Furosemid) darf nur nach strenger Indikation gegeben werden, um das Transplantat nicht zu gefährden. Globale Clearance-Formeln gelten hier nicht.',
    mnemonic: 'Transplantatniere im Becken → Detektor von ventral (vorne) einstellen!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 21b',
    pdfSource: 'Examen Fächergruppe 2, S. 15',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Unterschiede Transplantatniere vs. Eigennieren bei der Szintigraphie?',
    flashcardBack: '1. Ventraler Detektor (Bauchseite), da die Niere in der Beckengrube liegt.\n2. RVL-Aufnahmen (rechtsventrolateral).\n3. Lasix-Gabe nur nach strenger ärztlicher Rücksprache.\n4. Keine Clearance-Berechnung, da keine Referenzwerte für Einzel-Transplantate existieren.'
  },
  {
    id: 'q-ex-nuk10',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Verdacht auf Lungenembolie: Welche Besonderheiten weist 81m-Krypton in der Ventilationsszintigraphie auf?',
    options: [
      'Ultrakurze Halbwertszeit von nur 13 Sekunden erfordert kontinuierliche Beatmung während des Scans; Reihenfolge zu Perfusion beliebig; SPECT ist nicht möglich.',
      'Halbwertszeit von 5 Tagen; erfordert 3 Tage Isolierstation.',
      'Wird intravenös injiziert und blockiert die Alveolen.',
      'Gibt reine Alphastrahlung ab und verlangt einen Bleitubus.'
    ],
    correctIndex: 0,
    explanation: 'Kr-81m entsteht im Rubidium-81/Kr-81m Generator. Seine extrem kurze physikalische Halbwertszeit von T1/2 = 13 Sekunden bedeutet, dass das Gas sofort zerfällt. Der Patient inhaliert es permanent über eine Maske. Durch unterschiedliche Photopeak-Energien (Kr-81m = 190 keV vs. Tc-99m = 140 keV) können Ventilation und Perfusion zeitgleich oder in beliebiger Reihenfolge akquiriert werden.',
    mnemonic: '81m-Krypton: HWZ 13s → permanentes Inhalieren → sofortiger Zerfall!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 22a',
    pdfSource: 'Examen Fächergruppe 2, S. 15',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Besonderheiten von 81m-Krypton bei der Lungenventilation?',
    flashcardBack: '1. Sehr kurze Halbwertszeit von nur 13 Sekunden → Patient muss während der Aufnahme permanent ventilieren.\n2. Reihenfolge von Ventilation und Perfusion beliebig (unterschiedliche Gamma-Energien: Kr-81m 190 keV vs. Tc-99m 140 keV).\n3. Kein SPECT möglich.'
  },
  {
    id: 'q-ex-nuk11',
    deckId: 'deck-exam-nuklearmedizin',
    question: 'Welches Radiopharmakon wird für die Lungenperfusionsszintigraphie verwendet und wie lautet der szintigraphische Beweis für eine Lungenembolie?',
    options: [
      '99mTc-MAA (Mikroembolisierung von ca. 1:10.000 Lungenkapillaren); V/Q-Mismatch = segmentale Minderanreicherung in der Perfusion bei normaler Ventilation.',
      '99mTc-Pertechnetat; beidseitige diffuse Mehrspeicherung in der Ventilation.',
      '131-Jod; vollständiges Auslöschen beider Lungenflügel im Röntgenbild.',
      '99mTc-DMSA; Speicherung ausschließlich in den Bronchien.'
    ],
    correctIndex: 0,
    explanation: 'Für die Perfusion wird 99mTc-MAA (makroaggregiertes Humanalbumin, Partikelgröße 10–50 µm) i.v. injiziert. Die Partikel verstopfen temporär ca. 1 von 10.000 Lungenkapillaren. Hinter einem Embolus fließt kein Blut, die Partikel erreichen das Areal nicht ➔ kalter Bezirk (Perfusionsdefekt). Da die Belüftung (Ventilation) intakt ist, entsteht der typische Mismatch-Befund!',
    mnemonic: 'Lungenembolie = V/Q-Mismatch (Ventilation belüftet, aber Perfusion fehlt!).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 22b-c',
    pdfSource: 'Examen Fächergruppe 2, S. 15',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Lungenperfusion: Substanz, Mechanismus und Embolie-Befund?',
    flashcardBack: '• Substanz: 99mTc-MAA (Makroalbumin-Aggregate).\n• Mechanismus: Intravenöse Applikation; temporärer Verschluss von ca. 1:10.000 Lungenkapillaren (Mikroembolisation).\n• Befund bei Embolie: V/Q-Mismatch = keilförmige Minderanreicherung in der Perfusion bei regelrechter Ventilation.'
  },

  // ================= TEIL 4: DOSIMETRIE & STRAHLENSCHUTZGESETZGEBUNG =================
  {
    id: 'q-ex-strl1',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Welche drei fundamentalen Grundsätze regeln das deutsche Strahlenschutzrecht (§§ 6–8 StrlSchG)?',
    options: [
      'Rechtfertigung (Nutzen > Risiko), Optimierung (ALARA: Dosis so niedrig wie möglich) und Dosisbegrenzung (Grenzwerte für beruflich Exponierte und Bevölkerung).',
      'Kostenkontrolle, Geschwindigkeit und Geräteleistung.',
      'Abschirmung, Abstandsverdopplung und Arbeitszeitverlängerung.',
      'Dokumentationsverzicht, Strahlenmaximierung und Freiwilligkeit.'
    ],
    correctIndex: 0,
    explanation: '1. Rechtfertigung: Jede Anwendung ionisierender Strahlung muss einen hinreichenden individuellen oder gesellschaftlichen Nutzen erbringen, der das Strahlenrisiko überwiegt. 2. Optimierung (ALARA-Prinzip): Jede Dosis muss unter Berücksichtigung aller Umstände so gering wie vernünftigerweise erreichbar gehalten werden. 3. Dosisbegrenzung: Grenzwerte für Dosen dürfen keinesfalls überschritten werden.',
    mnemonic: 'Die 3 Grundsätze des StrlSchG: Rechtfertigung + Optimierung (ALARA) + Dosisbegrenzung.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 23a',
    pdfSource: 'Examen Fächergruppe 2, S. 16',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Die 3 Grundsätze im Strahlenschutzgesetz (§§ 6–8 StrlSchG)?',
    flashcardBack: '1. Rechtfertigung: Nutzen (Diagnose/Therapie) muss größer sein als das Strahlenrisiko.\n2. Optimierung (ALARA): Dosis so niedrig wie vernünftigerweise erreichbar halten (z.B. Einblendung, kV/mAs-Optimierung).\n3. Dosisbegrenzung: Gesetzliche Grenzwerte (z.B. 20 mSv/a beruflich) dürfen nicht überschritten werden.'
  },
  {
    id: 'q-ex-strl2',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Was besagt das LNT-Modell (Linear-No-Threshold) und welches Modell widerspricht ihm bei kleinen Dosen?',
    options: [
      'Das LNT-Modell geht davon aus, dass jedes noch so kleine Strahlenniveau ein proportional ansteigendes stochastisches Risiko birgt (keine Schwellendosis); das Hormesis-Modell behauptet dagegen eine nützliche Reparaturstimulation kleiner Dosen.',
      'Das LNT-Modell behauptet, dass Röntgenstrahlung unter 50 mSv das Krebswachstum stoppt.',
      'Das LNT-Modell gilt ausschließlich für Kernkraftwerke, nicht für die Medizin.',
      'Beide Modelle fordern die Aufhebung aller Grenzwerte.'
    ],
    correctIndex: 0,
    explanation: 'Das Linear-No-Threshold-Modell (LNT) ist die gesetzliche Risikobasis: Es postuliert, dass das Risiko stochastischer Schäden (Krebs, Mutationen) linear mit der Dosis wächst – ohne jede sichere Schwelle (jede Dosis schadet). Das Hormesis-Modell postuliert eine U-förmige Kurve: Kleinste Dosen sollen körpereigene DNA-Reparaturen stimulieren und nützen, erst höhere Dosen schaden. Gesetzlich gilt in Deutschland strikt das LNT-Modell!',
    mnemonic: 'LNT = Keine Schwelle, jede Dosis birgt Risiko! Hormesis = postulierter Reizeffekt (widerlegt/nicht gesetzlich).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 23b-d',
    pdfSource: 'Examen Fächergruppe 2, S. 16',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'LNT-Modell vs. Hormesis-Modell im Strahlenschutz?',
    flashcardBack: '• LNT-Modell (Linear-No-Threshold): Jede noch so kleine Strahlendosis stellt ein Risiko dar, das streng proportional mit der Dosis ansteigt (Grundlage aller Schutzvorschriften).\n• Hormesis-Modell: Widerspricht dem LNT-Modell; behauptet, dass sehr niedrige Strahlendosen durch Stimulation von Zellreparaturmechanismen nützlich sein könnten.'
  },
  {
    id: 'q-ex-strl3',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Nach welchem Verfahren und Dosiskriterium wird leicht radioaktiver Abfall in der Nuklearmedizin freigegeben?',
    options: [
      'Uneingeschränkte Freigabe für Radionuklide mit Halbwertszeit < 100 Tagen nach Abklinglagerung (mind. 10 HWZ) zur Entsorgung im Restmüll; Dosiskriterium: max. 10 µSv/Jahr für Einzelpersonen der Bevölkerung.',
      'Spezifische Freigabe zur Verklappung im Rhein.',
      'Sofortige Abholung durch ein Spezialunternehmen ohne Abklingen.',
      'Freigabe erst nach Ablauf von 300 Jahren.'
    ],
    correctIndex: 0,
    explanation: 'In Kliniken fallen schwach radioaktive Abfälle an (Spritzen, Tupfer, Urinflaschen mit Tc-99m, I-123 etc.). Isotope mit HWZ < 100 Tage lagern im Abklingraum (mind. 10 Halbwertszeiten). Nach Freimessung erfolgt die uneingeschränkte Freigabe in den normalen Hausmüll. Gesetzlicher Maßstab: Durch die Freigabe darf für keine Einzelperson der Bevölkerung mehr als 10 µSv effektive Dosis im Kalenderjahr entstehen!',
    mnemonic: 'Freigabe Klinikabfall: HWZ < 100 Tage, 10 HWZ abklingen, < 10 µSv/Jahr → Restmüll!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 24b-d',
    pdfSource: 'Examen Fächergruppe 2, S. 17',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Freigabe nuklearmedizinischer Abfälle: Verfahren, Voraussetzung und Grenzwert?',
    flashcardBack: '• Verfahren: Uneingeschränkte Freigabe zur Entsorgung im Restmüll.\n• Voraussetzung: Radionuklide mit kurzer Halbwertszeit (HWZ < 100 Tage), die man abklingen lassen kann (mind. 10 HWZ).\n• Dosiskriterium: Max. 10 µSv/Jahr für eine Einzelperson der Bevölkerung.'
  },
  {
    id: 'q-ex-strl4',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Warum können 8.000 Tonnen Bauschutt aus dem AKW-Rückbau Biblis NICHT wie Klinikabfall behandelt werden?',
    options: [
      'Weil Bauschutt langlebige Radionuklide mit Halbwertszeiten von vielen Jahren enthält (kann nicht abklingen) und die Massen viel zu gewaltig für Standard-Abklinglager sind.',
      'Weil Bauschutt im Gegensatz zu Klinikmüll brennbar ist.',
      'Weil das Atomgesetz Bauschutt grundsätzlich von Strahlenschutzgesetzen ausnimmt.',
      'Weil Kernkraftwerke keine Gammastrahlung emittieren.'
    ],
    correctIndex: 0,
    explanation: 'Aktivierter und kontaminierter Bauschutt aus Atomkraftwerken enthält Nuklide mit extrem langen Halbwertszeiten (z.B. Co-60 mit 5,3 Jahren, Cs-137 mit 30 Jahren). Ein Abklingen auf das 10-µSv-Niveau binnen Wochen ist physikalisch unmöglich. Zudem erfordern 8.000 Tonnen aufwendige Dekontaminationsverfahren oder eine Endlagerung als radioaktiver Abfall.',
    mnemonic: 'AKW-Bauschutt: Zu lange HWZ + gigantische Tonnen-Mengen = Abklingen unmöglich!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 24e',
    pdfSource: 'Examen Fächergruppe 2, S. 17',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Warum kann AKW-Bauschutt nicht wie Klinikabfall abgeklungen werden?',
    flashcardBack: '1. Zu lange Halbwertszeiten der enthaltenen Nuklide (kein zeitnahes Abklingen möglich).\n2. Viel zu große Materialmengen (tausende Tonnen).'
  },
  {
    id: 'q-ex-strl5',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Wie wird die Halbwertsschichtdicke (HWSD) für Röntgenstrahlung (60 keV) mit einer 241-Am-Quelle experimentell ermittelt?',
    options: [
      '1. Nulleffekt messen, 2. Impulsrate der Quelle ohne Absorber bestimmen, 3. Absorberstufen (Alu, Cu, Blei) einbringen, 4. Auf Halblogarithmenpapier auftragen, 5. Absorberdicke bei halber Netto-Impulsrate ablesen.',
      'Durch Wiegen der Bleiplatten auf einer Küchenwaage.',
      'Man misst die Temperaturerhöhung des Materials im Vakuum.',
      'Die HWSD kann ausschließlich im MRT gemessen werden.'
    ],
    correctIndex: 0,
    explanation: 'Der Versuchsaufbau nutzt ein Messgerät (Proportionalzähler) vor einer Bleiburganordnung. Nach Nulleffektmessung wird der ungeschwächte Leerwert I0 bestimmt. Dann werden Absorberplättchen definierter Dicke in den Strahlengang gebracht. Auf einfachlogarithmischem Papier ergibt die Schwächung eine Gerade. Die Dicke, bei der I = I0 / 2 erreicht ist, ist die HWSD.',
    mnemonic: 'HWSD-Versuch: Nulleffekt abziehen → Leerwert halbieren → Dicke am Graphen ablesen.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 25a',
    pdfSource: 'Examen Fächergruppe 2, S. 17',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Versuchsablauf zur Bestimmung der Halbwertsschichtdicke (HWSD)?',
    flashcardBack: '1. Untergrund / Nulleffekt mit Proportionalzähler messen.\n2. Leerwert (Impulsrate der Quelle ohne Absorber) messen.\n3. Absorberplatten sukzessive in den Strahlengang bringen und Zählrate notieren.\n4. Messwerte auf halblogarithmischem Papier eintragen (x: Dicke mm, y: Impulsrate IPS).\n5. Dicke bei halber Netto-Impulsrate ablesen = HWSD.'
  },
  {
    id: 'q-ex-strl6',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Von welchen physikalischen Größen hängt die Schwächung von Röntgen- und Gammastrahlung in Materie ab?',
    options: [
      'Dicke des durchstrahlten Materials (x), Dichte (ρ), Ordnungszahl des Materials (Z, Photoeffekt ~ Z³) und Photonenenergie (E, höhere Energie = geringere Schwächung).',
      'Luftfeuchtigkeit, Raumtemperatur, Beleuchtung und Farbe des Absorbers.',
      'Elektrische Leitfähigkeit, Gravitation und Schallgeschwindigkeit.',
      'Ausschließlich von der Aktivität der Quelle in Becquerel.'
    ],
    correctIndex: 0,
    explanation: 'Nach dem Schwächungsgesetz I(x) = I0 · e^(-µ·x) hängt die Schwächung vom linearen Schwächungskoeffizienten µ und der Dicke x ab. µ steigt linear mit der Dichte ρ und bei niedrigen Energien (Photoeffekt) mit der 3. bis 4. Potenz der Ordnungszahl Z (deshalb absorbiert Blei Z=82 so stark!). Mit steigender Photonenenergie sinkt der Absorptionskoeffizient.',
    mnemonic: 'Schwächung = Dicke × Dichte × Ordnungszahl Z (hoch!) geteilt durch Energie E.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 25b',
    pdfSource: 'Examen Fächergruppe 2, S. 17',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Wovon hängt die Schwächung von Röntgenstrahlung in Materie ab?',
    flashcardBack: '1. Dicke des Materials (je dicker, desto mehr Schwächung)\n2. Dichte (höhere Dichte = mehr Wechselwirkungen)\n3. Ordnungszahl Z (höhere OZ = stärkere Photoabsorption proportional zu Z³)\n4. Strahlenenergie (höhere Energie/kV = härtere Strahlung, geringere Schwächung)'
  },
  {
    id: 'q-ex-strl7',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Was unterscheidet Richtwert, Grenzwert und diagnostischen Referenzwert (DRW) und welche Konsequenzen haben Überschreitungen?',
    options: [
      'Grenzwert = gesetzlich verbindlich (z.B. 20 mSv/a; Überschreitung ➔ Meldung an Behörde, Arbeitsverbot); Richtwert = Planungs-/Orientierungsgröße (z.B. 1 mSv/a Bevölkerung); DRW = Dosisleitwert für Standarduntersuchungen (Überschreitung ➔ Dokumentations- & Begründungspflicht).',
      'Grenzwerte gelten nur für Patienten, DRW nur für Tiere.',
      'Richtwerte sind strafrechtlich sanktioniert, Grenzwerte sind unverbindliche Empfehlungen.',
      'Alle drei Begriffe bezeichnen exakt dieselbe Dosisgröße.'
    ],
    correctIndex: 0,
    explanation: '1. Grenzwert (§ 78 StrlSchG): Gesetzliche Obergrenze für beruflich Exponierte (20 mSv/Jahr). Bei Überschreitung muss der SSB die Behörde informieren und der Arzt über die Weiterbeschäftigung entscheiden. 2. Richtwert: Orientierungsgröße zur Dosisoptimierung (z.B. 1 mSv/a Bevölkerung). 3. DRW (§ 125 StrlSchG): Vom BfS ermittelte Richtwerte für Standardröntgen/-CT. Sie dürfen bei rechtfertigender Indikation (z.B. Adipositas) überschritten werden, müssen aber begründet dokumentiert werden.',
    mnemonic: 'Grenzwert = Gesetz (Stopp!). Richtwert = Orientierung. DRW = Standardvergleich (Begründen!).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 26a-c',
    pdfSource: 'Examen Fächergruppe 2, S. 18',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Unterschied: Richtwert vs. Grenzwert vs. Diagnostischer Referenzwert?',
    flashcardBack: '• Richtwert: Orientierungsgröße zur Abschätzung/Optimierung (z.B. 1 mSv/a Bevölkerung). Konsequenz: Arbeitsbedingungen prüfen.\n• Grenzwert: Gesetzlich verbindliche Höchstgrenze (z.B. 20 mSv/a beruflich). Konsequenz: Meldung an Behörde, SSB & Arzt, Prüfung Weiterbeschäftigung.\n• Referenzwert (DRW): Bewertungsgröße für Standarduntersuchungen. Konsequenz: Überschreitungen müssen dokumentiert und begründet werden.'
  },
  {
    id: 'q-ex-strl8',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Welche physikalischen Einheiten sind den Strahlenschutzgrößen korrekt zugeordnet?',
    options: [
      'Energiedosis = Gray (Gy) | Aktivität = Becquerel (Bq) | Äquivalent-/Effektive Dosis = Sievert (Sv) | Dosisflächenprodukt = cGy·cm² (oder µGy·m²)',
      'Energiedosis = Sievert (Sv) | Aktivität = Kilogramm | Dosisflächenprodukt = Watt',
      'Energiedosis = Becquerel (Bq) | Aktivität = Gray (Gy) | Röhrenspannung = Ampere',
      'Effektive Dosis = Kelvin | Dosisflächenprodukt = Pascal'
    ],
    correctIndex: 0,
    explanation: 'Energiedosis D: Gray [Gy = J/kg]. Aktivität A: Becquerel [Bq = 1 Zerfall/s]. Äquivalentdosis H & Effektive Dosis E: Sievert [Sv = J/kg]. Dosisflächenprodukt DFP: cGy·cm² oder µGy·m² (1 cGy·cm² = 1 µGy·m²). Röhrenspannung: Kilovolt (kV). Stromstärke: Ampere bzw. Milliampere (mA). Photonenenergie: Kiloelektronenvolt (keV).',
    mnemonic: 'Dosis = Gray (physikalisch) / Sievert (biologisch gewichtet). Zerfall = Becquerel.',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 27',
    pdfSource: 'Examen Fächergruppe 2, S. 18',
    difficulty: 'leicht',
    type: 'mc',
    flashcardFront: 'Einheiten im Strahlenschutz (ausgeschrieben und Abkürzung)?',
    flashcardBack: '• Energiedosis: Gray (Gy)\n• Aktivität: Becquerel (Bq)\n• Äquivalent- & Effektive Dosis: Sievert (Sv)\n• Dosisflächenprodukt: cGy·cm² oder µGy·m²\n• Strahlungsenergie: Kiloelektronenvolt (keV)\n• Röhrenspannung: Kilovolt (kV)\n• Stromstärke: Ampere (A)'
  },
  {
    id: 'q-ex-strl9',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Teleradiologie (§ 14 StrlSchG): Welche personelle Besetzung muss am Ort der Durchführung (z.B. Kreiskrankenhaus Eberbach) zwingend anwesend sein?',
    options: [
      'Ein Arzt mit den erforderlichen Kenntnissen im Strahlenschutz sowie eine MTR mit Fachkunde im Strahlenschutz.',
      'Ausschließlich ein Krankenpfleger und eine MFA ohne Kenntniskurs.',
      'Ein Facharzt für Radiologie muss immer persönlich im Raum stehen.',
      'Es ist überhaupt kein Personal vor Ort nötig, die Steuerung erfolgt per Webcam.'
    ],
    correctIndex: 0,
    explanation: 'Bei teleradiologischen Einsätzen (z.B. Nachtdienst/Wochenende) befundet der fachkundige Teleradiologe aus der Ferne. Am Durchführungsort (Krankenhaus vor Ort) müssen zwingend anwesend sein: 1. Eine MTR mit Fachkunde im Strahlenschutz zur technischen Durchführung und 2. Ein Arzt mit den erforderlichen Kenntnissen im Strahlenschutz (für Indikation, Kontrastmittelaufklärung und Notfallversorgung).',
    mnemonic: 'Teleradiologie vor Ort: Fachkundige MTR (Gerät) + Arzt mit Kenntnissen (Patient).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 28',
    pdfSource: 'Examen Fächergruppe 2, S. 19',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Personelle Besetzung vor Ort bei einem teleradiologischen Einsatz?',
    flashcardBack: '1. Arzt mit den erforderlichen Kenntnissen im Strahlenschutz (vor Ort am Patienten).\n2. MTR mit Fachkunde im Strahlenschutz (vor Ort zur technischen Durchführung).\n(Der Teleradiologe mit Fachkunde ist per Datenleitung zugeschaltet).'
  },
  {
    id: 'q-ex-strl10',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Wie ist das Berthold LB 122 Proportionalzählrohr aufgebaut und woran erkennt man eine Beschädigung der empfindlichen Eintrittsfolie?',
    options: [
      'Gasgefüllte Großflächenkammer mit Unterdruck und dünner Folie an der Unterseite mit Maschengitter; bei Folienriss strömt Luft ein ➔ Messwert fällt fälschlicherweise auf Null ab (intakte Folie muss nach innen gewölbt sein).',
      'Massiver Siliziumblock; bei Riss leuchtet eine rote LED dauerhaft auf.',
      'Vakuumröhre aus Blei; bei Beschädigung explodiert das Display.',
      'Das Gerät besitzt keine Folie, sondern ein 2 cm dickes Panzerglas.'
    ],
    correctIndex: 0,
    explanation: 'Das Berthold LB 122 ist ein Großflächen-Proportionalzählrohr für Kontaminationsmessungen in der Nuklearmedizin. Seine Unterseite besteht aus einer extrem dünnen, strahlungsdurchlässigen Mylar-/Titanfolie, die durch den internen Unterdruck sichtbar nach innen gewölbt ist. Reißt die Folie, dringt Luft ein, die Ladungstrennung bricht zusammen und das Gerät zeigt trotz Kontamination null Zählrate an (tödliche Scheinsicherheit!).',
    mnemonic: 'LB 122: Folie muss nach INNEN gewölbt sein! Loch = Lufteintritt = Null Zählrate!',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 29a-b',
    pdfSource: 'Examen Fächergruppe 2, S. 19',
    difficulty: 'schwer',
    type: 'mc',
    flashcardFront: 'Aufbau des Berthold LB 122 und Folien-Sichtprüfung?',
    flashcardBack: '• Aufbau: Gasgefüllte Ionisationskammer/Proportionalzählrohr mit Unterdruck, empfindliche strahlungsdurchlässige Folie an der Unterseite, Schutzgitter, Anode/Kathode zur Ladungstrennung.\n• Folienprüfung: Die Folie muss durch den Unterdruck nach innen gewölbt sein. Ist sie beschädigt, tritt Luft ein und der Messwert fällt auf Null ab.'
  },
  {
    id: 'q-ex-strl11',
    deckId: 'deck-exam-strahlenschutz',
    question: 'Welche Prüfschritte sind für die vorgeschriebene Einsatzprüfung eines Kontaminationsmonitors (LB 122) vorgeschrieben?',
    options: [
      '1. Batteriespannung prüfen, 2. Sichtprüfung (Gehäuse & nach innen gewölbte Folie intakt), 3. Nulleffekt messen (Zählrate im Untergrundbereich), 4. Prüfstrahlermessung (z.B. Sr-90), 5. Vergleich mit Sollwert (104 IPS ±10% nach HWZ-Korrektur).',
      'Gerät 24 Stunden in kochendes Wasser legen.',
      'Ausschließlich den Signalton auf Maximallautstärke testen.',
      'Eine Röntgenröhre auf das Messgerät richten und auslösen.'
    ],
    correctIndex: 0,
    explanation: 'Vor jedem Einsatz muss der Monitor geprüft werden: 1. Batteriestatus, 2. Sichtprüfung (Gehäuse, Schutzgitter, Eintrittsfolie), 3. Nulleffekt-Messung (Zählrate des normalen Untergrunds), 4. Messung an definierter Prüfstrahlerquelle (meist Sr-90 / Y-90 Beta-Strahler), 5. Sollwertvergleich (z.B. 104 IPS ± 10 % unter Berücksichtigung des Zerfalls seit Zertifikatsdatum). Bei Abweichung > 10% ist das Gerät zu sperren.',
    mnemonic: 'Einsatzprüfung: 1. Batterie, 2. Folie, 3. Nulleffekt, 4. Prüfstrahler (104 IPS ± 10%).',
    lawReference: 'Original Staatsexamen Aufgaben Fächergruppe 2, Aufg. 29c',
    pdfSource: 'Examen Fächergruppe 2, S. 19',
    difficulty: 'mittel',
    type: 'mc',
    flashcardFront: 'Detaillierter Prüfablauf eines Berthold LB 122 vor Einsatz?',
    flashcardBack: '1. Gerät einschalten & Batteriestatus prüfen.\n2. Sichtprüfung: Gehäuse, Schutzgitter und Fensterfolie intakt (nach innen gewölbt!).\n3. Nulleffekt messen: Zählrate im bekannten Untergrundbereich.\n4. Prüfstrahlermessung mit z.B. Sr-90 Prüfstrahler.\n5. Vergleich mit Sollwert: z.B. 104 IPS ± 10% (unter Berücksichtigung des radioaktiven Zerfalls).'
  }
]
