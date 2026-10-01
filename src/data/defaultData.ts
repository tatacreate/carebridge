import { Medication, PatientProfile, RoadmapDay } from '../types';

export const DEFAULT_PATIENT: PatientProfile = {
  name: 'Outpatient Recovery Patient',
  mrn: 'KFSH-894120',
  age: 24,
  gender: 'Female',
  nationality: 'Saudi Arabian',
  dateOfBirth: '2002-05-14',
  occupationStatus: 'employed',
  occupationOrStudy: 'Professional / Student',
  hospitalName: 'King Faisal Specialist Hospital & Research Centre (Riyadh)',
  doctorName: 'Attending Physician (استشاري الجراحة المشرف)',
  doctorPhone: '+966 11 464 7272',
  emergencyPhone: '997',
  dischargeDate: '2026-09-18',
  diagnosis: 'Laparoscopic Cholecystectomy & Post-Op Recovery (جراحة استئصال المرارة)',
  dischargeType: 'abdominal_surgery',
  admissionStatus: 'discharged_active',
  dischargeToken: 'CB-2026-894120',
  isVerifiedAccount: true,
  isDoctorLocked: true,
  username: '',
  email: 'taladaoud5b@gmail.com',
  password: '',
  nationalIdOrPassport: '1089201948',
  isLinkedToDoctor: true,
  activeDoctorId: 'doc-1',
  linkedDoctors: [
    {
      id: 'doc-1',
      name: 'Attending Surgical Consultant',
      title: 'Senior Surgical Consultant',
      hospital: 'King Faisal Specialist Hospital & Research Centre',
      department: 'General Surgery & Recovery',
      phone: '+966 11 464 7272',
      linkedAt: '2026-09-18',
      isPrimary: true,
      carePlanSummary: 'Post-Cholecystectomy 14-Day Wound & Pain Management Directive',
    },
  ],
  isAccountTerminated: false,
  physicianSignature: 'Attending Surgical Consultant, MD',
  physicianLicenseNo: 'SCFHS-REG-883921',
};

export const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Cefuroxime (Zinnat 500mg)',
    dosage: '1 Tablet (500mg)',
    frequency: 'Every 12 hours',
    times: ['08:00', '20:00'],
    foodInstruction: 'after_food',
    notes: 'Antibiotic to prevent surgical wound infection. Complete full 7-day course.',
    pillColor: '#0d9488', // Teal
    active: true,
    iconType: 'capsule',
  },
  {
    id: 'med-2',
    name: 'Paracetamol (Panadol Extra 1000mg)',
    dosage: '2 Tablets (1000mg total)',
    frequency: 'Every 8 hours as needed',
    times: ['08:00', '14:00', '20:00'],
    foodInstruction: 'after_food',
    notes: 'Pain management. Do not exceed 4000mg total in 24 hours.',
    pillColor: '#2563eb', // Blue
    active: true,
    iconType: 'pill',
  },
  {
    id: 'med-3',
    name: 'Clexane / Enoxaparin (40mg/0.4ml)',
    dosage: '1 Prefilled Syringe',
    frequency: 'Once daily at night',
    times: ['21:00'],
    foodInstruction: 'with_food',
    notes: 'Subcutaneous injection to prevent post-op deep vein thrombosis (DVT).',
    pillColor: '#dc2626', // Red
    active: true,
    iconType: 'injection',
  },
  {
    id: 'med-4',
    name: 'Omeprazole (Losec 20mg)',
    dosage: '1 Capsule (20mg)',
    frequency: 'Once daily in the morning',
    times: ['07:30'],
    foodInstruction: 'before_food',
    notes: 'Stomach acid reducer to protect stomach lining with antibiotics.',
    pillColor: '#d97706', // Amber
    active: true,
    iconType: 'capsule',
  },
];

export const DEFAULT_ROADMAP_DAYS: RoadmapDay[] = [
  {
    dayNumber: 0,
    title: 'Discharge Day & Hospital Transport (اليوم 0: مغادرة المستشفى ونقل المريض)',
    description: 'Crucial initial hours leaving the surgical ward, safe transport home, and pharmacy collection.',
    milestones: [
      { id: 'm0-1', text: 'Receive official hospital discharge papers and MRN summary', completed: true, category: 'activity' },
      { id: 'm0-2', text: 'Collect all discharge medications from hospital outpatient pharmacy', completed: true, category: 'medication' },
      { id: 'm0-3', text: 'Confirm emergency hospital hotline (997) is saved on patient phone', completed: true, category: 'activity' },
      { id: 'm0-4', text: 'Safe home transfer with seatbelt padded with pillow over surgical site', completed: true, category: 'activity' },
    ],
    allowedActivities: [
      'Rest comfortably in reclining position during vehicle ride',
      'Gentle ankle pumps every 30 minutes while sitting',
      'Small sips of room temperature water or warm chamomile tea',
    ],
    restrictedActivities: [
      'Do not carry any bags, luggage, or personal belongings',
      'No sudden abdominal twists or rapid sitting-to-standing movements',
      'No heavy meals or carbonated beverages',
    ],
    dietaryRestrictions: [
      'Sips of water, clear broth, or electrolyte drinks only',
      'Avoid fatty or heavy traditional meals for first 12 hours',
    ],
    redFlagsToWatch: [
      'Sudden dizziness or loss of consciousness during transport',
      'Active bleeding soaking through incision dressing',
    ],
  },
  {
    dayNumber: 1,
    title: 'Home Arrival & Bed Rest (اليوم الأول: العودة للمنزل والراحة)',
    description: 'Initial 24 hours focus on complete bed rest, hydration, pain management, and wound protection.',
    milestones: [
      { id: 'm1-1', text: 'Safely transfer from hospital to home without heavy strain', completed: true, category: 'activity' },
      { id: 'm1-2', text: 'Take evening post-op antibiotic dose after a light meal', completed: true, category: 'medication' },
      { id: 'm1-3', text: 'Check dressing: Ensure surgical site remains clean and dry', completed: false, category: 'wound' },
      { id: 'm1-4', text: 'Drink at least 1.5 liters of water or electrolyte solution', completed: false, category: 'diet' },
    ],
    allowedActivities: [
      'Short gentle walks around the bedroom (3-5 mins every 2 hours to prevent leg clots)',
      'Sitting upright in a comfortable chair with back support',
      'Deep breathing exercises using the incentive spirometer 5 times per hour',
    ],
    restrictedActivities: [
      'No lifting anything heavier than 2 kg (no heavy laundry or bags)',
      'No driving or operating machinery for 48 hours',
      'No showering or soaking in bath (sponge bath only for first 24h)',
    ],
    dietaryRestrictions: [
      'Clear liquids, warm soups, herbal tea (mint/chamomile), rice porridge',
      'Avoid oily, fried, heavily spiced dishes, and carbonated sodas',
      'Avoid high-fat dairy products for 48 hours',
    ],
    redFlagsToWatch: [
      'Fever over 38.0°C (100.4°F)',
      'Sudden sharp abdominal pain not relieved by Panadol',
      'Bleeding or dark red fluid soaking through the wound dressing',
    ],
  },
  {
    dayNumber: 2,
    title: 'Early Mobility & Wound Check (اليوم الثاني: الحركة الخفيفة وتفقد الجرح)',
    description: 'Gradual increase in indoor walking. First surgical dressing check.',
    milestones: [
      { id: 'm2-1', text: 'Perform 3 short corridor walks inside the home', completed: false, category: 'activity' },
      { id: 'm2-2', text: 'Inspect surgical dressing with family member using clean hands', completed: false, category: 'wound' },
      { id: 'm2-3', text: 'Tolerate soft solid foods without nausea', completed: false, category: 'diet' },
      { id: 'm2-4', text: 'Complete all 4 scheduled medication times', completed: false, category: 'medication' },
    ],
    allowedActivities: [
      'Gentle indoor walking up to 10 minutes at a time',
      'Light sitting room social visit with close family',
      'Careful shower if waterproof dressing is intact (pat dry with clean towel)',
    ],
    restrictedActivities: [
      'No bending forward sharply at the waist',
      'No climbing long flights of stairs rapidly',
      'No straining during bowel movements (use prescribed stool softener if needed)',
    ],
    dietaryRestrictions: [
      'Soft foods: boiled chicken breast, mashed potatoes, steamed carrots, yogurt',
      'High-fiber foods to encourage bowel activity',
      'Avoid gas-producing legumes (lentils, beans) for 3 days',
    ],
    redFlagsToWatch: [
      'Persistent nausea or inability to keep fluids down for 6 hours',
      'Calf swelling or pain in one leg (potential DVT warning)',
    ],
  },
  {
    dayNumber: 3,
    title: 'Digestive Normalization & Energy Recovery (اليوم الثالث: انتظام الهضم والشعور بالنشاط)',
    description: 'Transition to normal home routine while keeping wound clean and protected.',
    milestones: [
      { id: 'm3-1', text: 'Achieve normal bowel movement without severe straining', completed: false, category: 'diet' },
      { id: 'm3-2', text: 'Walk comfortably around the house for 15 minutes', completed: false, category: 'activity' },
      { id: 'm3-3', text: 'Complete Objective Symptom Checker evaluation in app', completed: false, category: 'wound' },
    ],
    allowedActivities: [
      'Indoor walking 15 minutes twice daily',
      'Light arm and leg stretching',
      'Reading, relaxed work from home without physical effort',
    ],
    restrictedActivities: [
      'No lifting weights or household furniture',
      'No swimming or Jacuzzi soaking',
      'No strenuous sports or jogging',
    ],
    dietaryRestrictions: [
      'Balanced low-fat diet with lean proteins and fresh cooked vegetables',
      'Drink 2 to 2.5 liters of fluids daily',
    ],
    redFlagsToWatch: [
      'Pus, foul odor, or yellowish discharge from incision points',
      'Redness spreading out from wound edges (> 2 cm)',
    ],
  },
  {
    dayNumber: 5,
    title: 'Mid-Week Checkpoint & Activity Expansion (اليوم الخامس: التوسع في النشاط وطلب الاستشارة)',
    description: 'Assessing stamina, wound healing progress, and scheduling follow-up appointment.',
    milestones: [
      { id: 'm5-1', text: 'Confirm follow-up hospital clinic appointment date', completed: false, category: 'activity' },
      { id: 'm5-2', text: 'Reduce pain medication frequency as pain diminishes', completed: false, category: 'medication' },
      { id: 'm5-3', text: 'Surgical incision dry with no new redness', completed: false, category: 'wound' },
    ],
    allowedActivities: [
      'Short outdoor walk on flat paved ground (10-15 mins with family)',
      'Normal light household sitting activities',
    ],
    restrictedActivities: [
      'No driving if taking narcotics or experiencing abdominal discomfort',
      'No heavy lifting or intense core abdominal exercises',
    ],
    dietaryRestrictions: [
      'Full regular diet with controlled fat and spice intake',
    ],
    redFlagsToWatch: [
      'New onset dizziness or feeling lightheaded',
      'Chills, shivering, or spike in body temperature',
    ],
  },
  {
    dayNumber: 7,
    title: '7-Day Milestone & Doctor Follow-up (اليوم السابع: موعد مراجعة الطبيب وتقييم التعافي)',
    description: '1-week milestone evaluation and surgical clinic visit for wound inspection / suture check.',
    milestones: [
      { id: 'm7-1', text: 'Attend 1-week post-op clinic review with your attending surgeon', completed: false, category: 'activity' },
      { id: 'm7-2', text: 'Finish full antibiotic prescription course as directed', completed: false, category: 'medication' },
      { id: 'm7-3', text: 'Obtain medical clearance for driving and light work return', completed: false, category: 'activity' },
    ],
    allowedActivities: [
      'Normal walking routine',
      'Driving short distances if approved by doctor and pain-free',
    ],
    restrictedActivities: [
      'No heavy gym lifting (> 5 kg) for another 3 weeks unless cleared',
    ],
    dietaryRestrictions: [
      'Maintain healthy, high-protein diet for tissue healing',
    ],
    redFlagsToWatch: [
      'Any late onset fever or abdominal distension',
    ],
  },
  {
    dayNumber: 14,
    title: '2-Week Check & Suture/Staple Removal (اليوم الرابع عشر: فك الغرز وإزالة الشاش)',
    description: '2-week surgical assessment, potential suture/staple removal, and scar tissue review.',
    milestones: [
      { id: 'm14-1', text: 'Complete surgical clinic visit for suture/staple inspection', completed: false, category: 'wound' },
      { id: 'm14-2', text: 'Resume normal daily prayer posture (sitting to standing) smoothly', completed: false, category: 'activity' },
      { id: 'm14-3', text: 'Discontinue regular prescription painkillers as pain resolves', completed: false, category: 'medication' },
    ],
    allowedActivities: [
      'Light household chores and office desktop work',
      'Brisk outdoor walking up to 30 minutes',
      'Light driving and routine grocery trips without heavy lifting',
    ],
    restrictedActivities: [
      'No lifting heavy items over 5 kg',
      'No vigorous abdominal exercises or competitive sports',
    ],
    dietaryRestrictions: [
      'Normal balanced diet rich in Vitamin C, Zinc, and protein for collagen building',
    ],
    redFlagsToWatch: [
      'Incision reopening (dehiscence) or sudden warm fluid drainage',
    ],
  },
  {
    dayNumber: 30,
    title: '1-Month Full Clearance & Long-Term Health (اليوم الثلاثون: التعافي التام والعودة للحياة الطبيعية)',
    description: '30-day post-op milestone marking complete tissue healing and return to full active lifestyle.',
    milestones: [
      { id: 'm30-1', text: 'Final doctor clearance for unrestricted physical activities and gym', completed: false, category: 'activity' },
      { id: 'm30-2', text: 'Complete full 30-day recovery log review in +CareBridge app', completed: false, category: 'activity' },
      { id: 'm30-3', text: 'Surgical scar fully closed, lightened, and non-tender', completed: false, category: 'wound' },
    ],
    allowedActivities: [
      'Full return to work, sports, travel, and swimming',
      'Unrestricted physical exertion as cleared by surgical consultant',
    ],
    restrictedActivities: [
      'None (unless specified by attending surgeon for specific organ surgery)',
    ],
    dietaryRestrictions: [
      'Long-term healthy balanced diet and adequate daily hydration',
    ],
    redFlagsToWatch: [
      'Late hernia formation at incision site (bulge or pain under scar)',
    ],
  },
];

import { EducationalArticle, VideoGuide, FAQItem } from '../types';

export const DEFAULT_EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: 'art-1',
    category: 'wound_care',
    readTimeMinutes: 4,
    icon: 'ShieldCheck',
    title: {
      ar: 'دليل العناية بالجرح الجراحي ومنع التهاب الغرز في المنزل',
      en: 'Home Care Guide: Surgical Wound Hygiene & Infection Prevention',
      ur: 'گھر پر جراحی کے زخم کی دیکھ بھال اور انفیکشن سے بچاؤ کا طریقہ',
      tl: 'Gabay sa Pangangalaga ng Sugat sa Bahay at Pag-iwas sa Impeksyon',
    },
    summary: {
      ar: 'إرشادات سريرية موثوقة لكيفية تنظيف وتغيير الضمادة الجراحية بأسلوب معقم لمنع العدوى البكتيرية.',
      en: 'Clinical guidelines on changing surgical dressings, keeping the incision dry, and recognizing early infection signs.',
      ur: 'جراحی کی پٹی بدلنے اور زخم کو صاف اور خشک رکھنے کی اہم طبی ہدایات۔',
      tl: 'Mga medikal na gabay sa pagpapalit ng bandage, pagpapanatiling tuyo ng sugat, at pagkilala sa impeksyon.',
    },
    content: {
      ar: [
        '1. غسل اليدين جيداً بالماء والصابون لمدة 20 ثانية قبل لمس الضمادة الجراحية.',
        '2. المحافظة على جفاف ونظافة موضع العملية. تجنب نقع الجرح في الماء أثناء الاستحمام في الأسبوع الأول.',
        '3. مراقبة حواف الجرح يومياً؛ التورم الخفيف الشفاف طبيعي، بينما خروج الصديد أو الاحمرار الممتد يعبر عن التهاب.',
        '4. تجنب حك أو إزالة القشور المتكونة فوق الجرح لضمان عدم حدوث ندبات أو فتح للغرز.',
      ],
      en: [
        '1. Always wash your hands thoroughly with warm water and soap for at least 20 seconds before touching your wound or dressing.',
        '2. Keep the incision area clean and dry. Avoid soaking in baths, hot tubs, or swimming pools until cleared by your surgeon.',
        '3. Inspect the incision daily. Slight clear fluid is normal, but yellow/green pus, foul odor, or spreading redness requires doctor evaluation.',
        '4. Do not pick at surgical scabs or staples. Allow scabs to slough off naturally to prevent scarring and wound opening.',
      ],
      ur: [
        '1. پٹی کو ہاتھ لگانے سے پہلے اپنے ہاتھوں کو 20 سیکنڈ تک صابن سے اچھی طرح دھوئیں۔',
        '2. زخم کی جگہ کو ہمیشہ صاف اور خشک رکھیں۔ پہلے ہفتے میں نہاتے وقت زخم کو پانی میں نہ بھگوئیں۔',
        '3. روزانہ زخم کا معائنہ کریں۔ ہلکا پانی آنا نارمل ہے، لیکن پیپ یا بدبو آنے پر فوراً ڈاکٹر سے رجوع کریں۔',
        '4. زخم کے اوپر بننے والے خُرنڈ کو خود سے نہ اتاریں۔',
      ],
      tl: [
        '1. Maghugas ng kamay gamit ang sabon at tubig nang hindi bababa sa 20 segundo bago hawakan ang sugat o bandage.',
        '2. Panatilihing malinis at tuyo ang pinag-operahan. Iwasang ibabad sa tubig o paligo hanggang payagan ng doktor.',
        '3. Suriin ang sugat araw-araw. Ang kaunting malinaw na tubig ay normal, ngunit ang dilaw/berdeng nana o mabahong amoy ay kailangang ipakita sa doktor.',
        '4. Huwag kikutin ang langib ng sugat para maiwasan ang sugat at impeksyon.',
      ],
    },
    keyTakeaways: {
      ar: ['غسل اليدين معقم دائماً', 'الضمادة الناشفة أسرع للشفاء', 'الصديد يستدعي مراجعة الطبيب'],
      en: ['Always wash hands before dressing changes', 'Keep wound clean and dry', 'Pus or fever means immediate call to doctor'],
      ur: ['ہاتھوں کی صفائی ضروری ہے', 'زخم کو خشک رکھیں', 'پیپ آنے پر ڈاکٹر کو دکھائیں'],
      tl: ['Maghugas ng kamay bago palitan ang bandage', 'Panatilihing tuyo ang sugat', 'Pumunta sa doktor kapag may nana'],
    },
  },
  {
    id: 'art-2',
    category: 'dvt_prevention',
    readTimeMinutes: 5,
    icon: 'Activity',
    title: {
      ar: 'الوقاية من الجلطات الوريدية (DVT) تمارين الساقين وحقن كليكسان',
      en: 'DVT Blood Clot Prevention: Leg Exercises & Anticoagulant Injection Safety',
      ur: 'خون کے جمنے (DVT) سے بچاؤ: ٹانگوں کی ورزشیں اور احتیاطی تدابیر',
      tl: 'Pag-iwas sa DVT Blood Clot: Mga Eehersisyo sa Binti at Paalala',
    },
    summary: {
      ar: 'كيفية أداء تمارين مضخة الكاحل والمشي الخفيف لمنع تجلط الدم في الساقين بعد العمليات الجراحية.',
      en: 'Learn how ankle pump exercises, compression socks, and prescribed blood thinners protect post-op patients from dangerous leg clots.',
      ur: 'آپریشن کے بعد ٹانگوں میں خون جمنے سے بچنے کے لیے آسان ورزشیں اور ضروری ہدایات۔',
      tl: 'Alamin kung paano ang mga ehersisyo sa binti at gamot ay nagpoprotekta labان sa blood clot pagkatapos ng operasyon.',
    },
    content: {
      ar: [
        '1. أداء تمارين مضخة الكاحل: تحريك القدمين للأعلى وللأسفل 10 مرات كل ساعة أثناء الجلوس أو الاستلقاء.',
        '2. المشي الخفيف داخل المنزل لمدة 3 إلى 5 دقائق كل ساعتين لتنشيط الدورة الدموية في الساقين.',
        '3. الالتزام بموعد إعطاء حقنة تحت الجلد المانعة للتجلط (مثل كليكسان) كما حددها الطبيب المعالج.',
        '4. الانتباه لعلامات DVT: تورم شديد في ساق واحدة، ألم بالربلة، أو احمرار وسخونة بالساق.',
      ],
      en: [
        '1. Perform ankle pump exercises: Flex and point your feet up and down 10 times every hour while resting in bed or chair.',
        '2. Walk short distances indoors for 3-5 minutes every 2 hours to keep blood circulating smoothly.',
        '3. Take prescribed subcutaneous anticoagulant injections (e.g., Clexane/Lovenox) at the exact scheduled night time.',
        '4. Watch for DVT warning signs: Pain or tenderness in one calf, noticeable leg swelling, or warmth and redness in the leg.',
      ],
      ur: [
        '1. ٹخنوں کی ورزشیں کریں: بستر پر لیٹے ہوئے اپنے پاؤں کو اوپر نیچے 10 بار حرکت دیں۔',
        '2. ہر دو گھنٹے بعد گھر کے اندر 3 سے 5 منٹ کے لیے ہلکی واک کریں۔',
        '3. خون پتلا کرنے والے انجیکشن (Clexane) ڈاکٹر کی بتائی گئی ہدایت کے مطابق وقت پر لیں۔',
        '4. ایک ٹانگ میں سوجن یا شدید درد ہونے پر فوراً ڈاکٹر سے رابطہ کریں۔',
      ],
      tl: [
        '1. Mag-ankle pump exercises: Igalaw ang paa pataas at pababa ng 10 beses bawat oras habang nakahiga o nakaupo.',
        '2. Maglakad nang mabilis sa loob ng bahay ng 3-5 minuto bawat 2 oras para sa sirkulasyon ng dugo.',
        '3. Inumin o iturok ang iniresetang blood thinner (hal. Clexane) sa eksaktong oras.',
        '4. Mag-ingat sa sintomas ng DVT: Pananakit o pamamaga sa isang binti o pamumula.',
      ],
    },
    keyTakeaways: {
      ar: ['تحريك الكاحل 10 مرات شهرياً', 'المشي الخفيف يمنع التجلط', 'التورم بساق واحدة مؤشر خطر'],
      en: ['Do ankle pumps 10x hourly', 'Light indoor walking prevents clots', 'Single leg swelling requires evaluation'],
      ur: ['ٹخنوں کی ورزش روزانہ کریں', 'ہلکی واک خون کی گردش بحال رکھتی ہے', 'ایک ٹانگ کی سوجن پر محتاط رہیں'],
      tl: ['Mag-ehersisyo ng paa bawat oras', 'Maglakad-lakad sa bahay', 'Pumunta sa doktor kapag namaga ang isang binti'],
    },
  },
  {
    id: 'art-3',
    category: 'nutrition',
    readTimeMinutes: 4,
    icon: 'Utensils',
    title: {
      ar: 'التغذية الصحية والتغلب على إمساك ما بعد العمليات الجراحية',
      en: 'Post-Op Nutrition & Preventing Surgical Constipation',
      ur: 'آپریشن کے بعد خوراک اور قبض سے بچاؤ کے طریقے',
      tl: 'Wastong Pagkain at Pag-iwas sa Pagtatae at Constipation',
    },
    summary: {
      ar: 'إرشادات الأغذية الموصى بها لتسريع التئام الأنسجة ومكافحة خمول الأمعاء الناتج عن المسكنات.',
      en: 'Dietary guidance on high-fiber foods, adequate hydration, and avoiding gas-producing meals during early recovery.',
      ur: 'آسان اور ہضم ہونے والی خوراک کے ذریعے جلدی صحتیابی اور قبض سے بچاؤ کی معلومات۔',
      tl: 'Mga masustansyang pagkain para sa mabilis na paggaling ng sugat at pag-iwas sa hirap sa pagdumi.',
    },
    content: {
      ar: [
        '1. شرب 2 إلى 2.5 ليتر من الماء والسوائل الدافئة يومياً لتنشيط حركة الأمعاء الناتجة عن أدوية الألم.',
        '2. تناول وجبات صغيرة خفيفة وموزعة على 5 مرات بدلاً من الوجبات الكبيرة الثقيلة.',
        '3. التركيز على البروتينات الصافية (دجاج مسلوق، سمك، بيض) والخضار المطهوة بالبخار لبناء ألياف الجرح.',
        '4. تجنب المقليات، الأطعمة الدسمة، والغازيات في الأسبوع الأول لتفادي الانتفاخ والضغط على بطن الجراحة.',
      ],
      en: [
        '1. Drink 2 to 2.5 liters of water and warm fluids daily to combat bowel sluggishness caused by pain medications.',
        '2. Eat 5-6 small light meals spread throughout the day rather than 2-3 large heavy meals.',
        '3. Include lean proteins (boiled chicken, fish, eggs) and steamed vegetables to supply essential amino acids for tissue healing.',
        '4. Avoid fried foods, heavy spices, legumes, and carbonated sodas during the first week to prevent uncomfortable gas bloating.',
      ],
      ur: [
        '1. روزانہ 2 سے 2.5 لیٹر پانی اور گرم سیال اشیاء پیئیں تاکہ آنتوں کی حرکت بہتر رہے۔',
        '2. بھاری کھانے کی بجائے دن میں 5 سے 6 بار ہلکی اور تھوڑی خوراک لیں۔',
        '3. اُبلا ہوا مرغی کا گوشت، مچھلی اور سبزیاں کھائیں تاکہ زخم جلدی بھر سکے۔',
        '4. پہلے ہفتے میں تلی ہوئی اور مسالے دار اشیاء سے پرہیز کریں۔',
      ],
      tl: [
        '1. Uminom ng 2 hanggang 2.5 litrong tubig at maligamgam na sabaw araw-araw para maiwasan ang constipation.',
        '2. Kumain ng maliliit at magagaan na pagkain 5-6 beses sa isang araw imbes na malalaking kainan.',
        '3. Kumain ng nilagang manok, isda, itlog, at gulay para sa collagen ng sugat.',
        '4. Iwasan ang matataba, prito, at softdrinks sa unang linggo para maiwasan ang kabag.',
      ],
    },
    keyTakeaways: {
      ar: ['شرب الماء يمنع الإمساك', 'وجبات صغيرة متكررة', 'تجنب الدهون والغازيات'],
      en: ['Drink plenty of fluids', 'Eat small frequent meals', 'Avoid fatty and gas-forming foods'],
      ur: ['زیادہ پانی پیئیں', 'تھوڑی اور ہلکی خوراک لیں۔', 'تلی ہوئی اشیاء سے پرہیز کریں'],
      tl: ['Uminom ng maraming tubig', 'Kumain ng onti-onti pero madalas', 'Iwasan ang prito at softdrinks'],
    },
  },
];

export const DEFAULT_VIDEO_GUIDES: VideoGuide[] = [
  {
    id: 'vid-1',
    category: 'wound_care',
    duration: '03:15',
    thumbnailBg: 'from-teal-700 to-slate-900',
    videoUrlPlaceholder: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: {
      ar: 'فيديو تعليمي: الخطوات المعقمة لتغيير الضمادة في المنزل',
      en: 'Video Guide: Sterile Step-by-Step Dressing Change at Home',
      ur: 'ویڈیو رہنمائی: گھر پر زخم کی پٹی بدلنے کا صحیح طریقہ',
      tl: 'Video Guide: Tamang Paraan ng Pagpalit ng Bandage sa Bahay',
    },
    description: {
      ar: 'شرح مرئي مبسط يوضح كيفية إعداد الأدوات المعقمة، إزالة الشاش القديم، وتطهير الجرح بأمان.',
      en: 'A step-by-step visual demonstration on preparing sterile supplies, cleaning the wound, and applying fresh gauze.',
      ur: 'پٹی بدلنے، زخم کو صاف کرنے اور جراثیم سے پاک پٹی لگانے کی مکمل ویڈیو۔',
      tl: 'Ipinapakita ang tamang paglilinis ng sugat at paglalagay ng bagong malinis na bandage.',
    },
    chapters: {
      ar: [
        { time: '00:00', title: 'غسل اليدين وإعداد الأدوات المعقمة' },
        { time: '00:45', title: 'إزالة الضمادة القديمة برفق بدون شد' },
        { time: '01:30', title: 'تطهير موضع الجرح بالمسحة الطبية المعقمة' },
        { time: '02:30', title: 'تثبيت الشاش المعقم الجديد والشريط اللاصق' },
      ],
      en: [
        { time: '00:00', title: 'Hand Hygiene & Preparing Sterile Pack' },
        { time: '00:45', title: 'Gently Peeling & Removing Old Gauze' },
        { time: '01:30', title: 'Antiseptic Cleansing of Incision Line' },
        { time: '02:30', title: 'Applying Fresh Sterile Dressing & Tape' },
      ],
      ur: [
        { time: '00:00', title: 'ہاتھ دھونا اور پٹی کا سامان تیار کرنا' },
        { time: '00:45', title: 'پرانی پٹی آرام سے اتارنا' },
        { time: '01:30', title: 'زخم کی جگہ کی صفائی' },
        { time: '02:30', title: 'نئی جراثیم سے پاک پٹی لگانا' },
      ],
      tl: [
        { time: '00:00', title: 'Paghuhugas ng Kamay at Gamit' },
        { time: '00:45', title: 'Dahang-dahang Pagtanggal ng Lumang Bandage' },
        { time: '01:30', title: 'Paglilinis sa Linya ng Sugat' },
        { time: '02:30', title: 'Paglalagay ng Bagong Malinis na Bandage' },
      ],
    },
  },
  {
    id: 'vid-2',
    category: 'dvt_prevention',
    duration: '02:45',
    thumbnailBg: 'from-blue-700 to-indigo-950',
    videoUrlPlaceholder: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: {
      ar: 'فيديو تعليمي: تمارين الساقين الوقائية ومنع تجلط الدم بعد الجراحة',
      en: 'Video Guide: Post-Operative Leg & Ankle Circulation Exercises',
      ur: 'ویڈیو رہنمائی: ٹانگوں کی ورزشیں اور خون جمنے سے بچاؤ',
      tl: 'Video Guide: Eehersisyo sa Binti Para sa Magandang Sirkulasyon',
    },
    description: {
      ar: 'تمارين حركية بسيطة لساقين ومفصل الكاحل يمكن إجراؤها على السرير للحد من التجلط الوريدي.',
      en: 'Visual demonstration of ankle flexes, foot circles, and knee pumps to promote healthy venous return.',
      ur: 'بستر پر لیٹے ہوئے ٹانگوں کو حرکت دینے کی آسان اور مفید ورزشیں۔',
      tl: 'Mga simpleng ehersisyo sa binti habang nakahiga para sa maayos na daloy ng dugo.',
    },
    chapters: {
      ar: [
        { time: '00:00', title: 'تمرين مضخة الكاحل (Ankle Pumps)' },
        { time: '00:50', title: 'تمرين تدوير مفصل القدم' },
        { time: '01:40', title: 'تمرين انقباض عضلة الفخذ الخفيف' },
        { time: '02:15', title: 'تعليمات المشي الخفيف داخل الغرفة' },
      ],
      en: [
        { time: '00:00', title: 'Ankle Pump Flexions & Extensions' },
        { time: '00:50', title: 'Clockwise & Counter Foot Circles' },
        { time: '01:40', title: 'Gentle Quadriceps Tightening' },
        { time: '02:15', title: 'Short Corridor Walking Form' },
      ],
      ur: [
        { time: '00:00', title: 'ٹخنے کو اوپر نیچے موڑنا' },
        { time: '00:50', title: 'پاؤں کو گول گھمانا' },
        { time: '01:40', title: 'ران کے پٹھوں کی ورزش' },
        { time: '02:15', title: 'کمرے میں ہلکی واک کا طریقہ' },
      ],
      tl: [
        { time: '00:00', title: 'Pagalaw ng Paa Pataas at Pababa' },
        { time: '00:50', title: 'Paihip ng Paa sa Paligid' },
        { time: '01:40', title: 'Pagpapatigas sa Binti' },
        { time: '02:15', title: 'Tamang Paglalakad sa Bahay' },
      ],
    },
  },
];

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'wound_care',
    question: {
      ar: 'متى يمكنني الاستحمام بالماء بصفة طبيعية بعد العملية؟',
      en: 'When can I take a full shower after my surgery?',
      ur: 'آپریشن کے بعد میں کب مکمل طور پر نہا سکتا ہوں؟',
      tl: 'Kailan ako pwedeng maligo nang buo pagkatapos ng operasyon?',
    },
    answer: {
      ar: 'يمكنك الاستحمام بالرشاش الخفيف عادةً بعد 48 ساعة إذا كانت الضمادة مقاومة للماء المباشر، مع تجنب فرك الجرح بالصابون أو غمره في البانيو حتى يلتئم كلياً ويصرح الطبيب بذلك.',
      en: 'You can typically take a gentle standing shower 48 hours post-op if you have a waterproof dressing. Avoid scrubbing the incision directly or soaking in a tub until cleared by your surgeon.',
      ur: 'عموماً 48 گھنٹے بعد اگر واٹر پروف پٹی لگی ہو تو ہلکا شاور لیا جا سکتا ہے۔ لیکن زخم پر صابن نہ رگڑیں اور نہ ہی پانی میں زیادہ دیر بیٹھیں۔',
      tl: 'Maaari kang maligo nang nakatayo pagkalipas ng 48 oras kung waterproof ang iyong bandage. Iwasang kuskusin ang sugat o magbabad sa tub.',
    },
  },
  {
    id: 'faq-2',
    category: 'medication_safety',
    question: {
      ar: 'ماذا أفعل إذا نسيت جرعة من المضاد الحيوي أو دواء المسكن؟',
      en: 'What should I do if I miss a scheduled dose of antibiotics or pain medicine?',
      ur: 'اگر میں اینٹی بائیوٹک یا درد کی دوا کی خوراک بھول جاؤں تو کیا کروں؟',
      tl: 'Ano ang dapat kong gawin kapag nakalimutan ko ang aking gamot?',
    },
    answer: {
      ar: 'خذ الجرعة الفائتة فور تذكرها، إلا إذا كان موعد الجرعة التالية قريباً جداً (أقل من ساعتين). لا تقم بمضاعفة الجرعة أبداً لتدارك الفاقد.',
      en: 'Take the missed dose as soon as you remember, unless it is almost time for your next scheduled dose (within 2 hours). Never double up on doses to make up for a missed one.',
      ur: 'یاد آتے ہی دوا لے لیں، لیکن اگر اگلی خوراک کا وقت قریب ہے تو ڈبل خوراک نہ لیں۔',
      tl: 'Inumin ang nakalimutang dosis sa sandaling maalala mo, maliban kung malapit na ang susunod na oras. Huwag kailanman mag-double dose.',
    },
  },
  {
    id: 'faq-3',
    category: 'warning_signs',
    question: {
      ar: 'هل ارتفاع الحرارة الخفيف إلى 37.5°م يعتبر خطيراً؟',
      en: 'Is a mild post-op temperature of 37.5°C normal or concerning?',
      ur: 'کیا آپریشن کے بعد 37.5°C کا ہلکا بخار نارمل ہے؟',
      tl: 'Normal ba ang bahagyang lagnat na 37.5°C pagkatapos ng operasyon?',
    },
    answer: {
      ar: 'ارتفاع الحرارة الخفيف (بين 37.2°م و 37.6°م) شائع جداً في أول 48 ساعة بسبب استجابة الجسم الجراحية. ولكن إذا تجاوزت الحرارة 38.0°م مع قشعريرة، يجب التواصل فوراً مع المستشفى.',
      en: 'A low-grade temperature (37.2°C to 37.6°C) is common in the first 48 hours as part of the body tissue response. However, a fever of 38.0°C (100.4°F) or higher with chills requires clinical review.',
      ur: 'پہلے 48 گھنٹوں میں ہلکا درجہ حرارت نارمل ہوتا ہے۔ لیکن اگر درجہ حرارت 38.0°C سے بڑھ جائے تو فوراً ڈاکٹر سے رابطہ کریں۔',
      tl: 'Ang bahagyang lagnat (37.2°C hanggang 37.6°C) ay karaniwan sa unang 48 oras. Ngunit kapag umabot sa 38.0°C o mas mataas na may panginginig, ipagbigay-alam agad sa doktor.',
    },
  },
  {
    id: 'faq-4',
    category: 'nutrition',
    question: {
      ar: 'كيف أتعامل مع الإمساك وصعوبة التبرز الناتجة عن أدوية الألم؟',
      en: 'How can I treat post-operative constipation caused by painkillers?',
      ur: 'درد کی دوائیوں سے ہونے والی قبض کا علاج کیسے کریں؟',
      tl: 'Paano gagamutin ang hirap sa pagdumi dulot ng gamot sa sakit?',
    },
    answer: {
      ar: 'أكثر من شرب الماء الساخن والعصائر الطبيعية (مثل عصير القراصيا أو التمر)، وتناول الأطعمة الغنية بالألياف كالخضروات والمشوفان. إذا استمر الإمساك لأكثر من 3 أيام، استخدم ملين الأمعاء الموصوف من المستشفى.',
      en: 'Increase fluid intake, consume high-fiber foods (prunes, oatmeal, steamed vegetables), and walk gently. If constipation persists past 3 days, take the stool softener prescribed in your discharge discharge pack.',
      ur: 'زیادہ پانی پیئیں، فائبر والی خوراک لیں اور ہلکی واک کریں۔ اگر 3 دن سے زیادہ قبض رہے تو ڈاکٹر کا بتایا ہوا ملین استعمال کریں۔',
      tl: 'Uminom ng maraming tubig, kumain ng mataas sa fiber na pagkain, at maglakad-lakad. Kung lumagpas sa 3 araw ang constipation, gamitin ang iniresetang pampalambot ng dumi.',
    },
  },
];

