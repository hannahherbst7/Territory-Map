/* ============================================================================
   CONDITION DATA — this is the file to edit when adding or tuning conditions.
   The engine in index.html reads this file; you should not need to touch
   index.html to expand the condition list.

   HOW A "TEST" WORKS (the `when:` value on features and red-flag rules):
     { field: "quality", is: ["pressure"] }   → true when that input equals one
                                                of the listed values
     { flag: "assoc.sob" }                    → true when that checkbox is on
     { num: "vitals.hr", gte: 100 }           → numeric compare (gte/lte/lt/gt).
                                                If the field was left blank the
                                                feature is SKIPPED entirely —
                                                it doesn't count for or against.
     { any: [test, test, ...] }               → true if any sub-test is true
     { all: [test, test, ...] }               → true only if all are true

   INPUT FIELDS AVAILABLE (see readInput() in index.html):
     age, sex ("male"/"female")
     hist.smoking hist.cardiac hist.clotting hist.cancer hist.surgery_immobility
     hist.connective_tissue hist.lung_disease hist.gerd
     onset ("sudden"/"gradual")
     quality ("sharp"/"pressure"/"burning"/"tearing")
     pos.worse_lying  pos.pleuritic  pos.palpation  pos.one_sided
     rad.back rad.jaw rad.arm rad.shoulder rad.none
     assoc.sob assoc.diaphoresis assoc.nausea assoc.fever assoc.cough
     assoc.palpitations assoc.dizziness assoc.viral assoc.vomiting assoc.trauma
     exertion ("exertion"/"rest")
     duration ("constant"/"episodic"/"brief")
     vitals.sbp vitals.hr vitals.spo2 (numbers, may be blank)
     exam.unequal_bp exam.neck_veins

   SCORING: score = (matched features − matched "against" features) / total
   features, so `against:` entries are things that actively point AWAY from the
   condition (e.g. chest-wall tenderness points away from a heart attack).
   ========================================================================== */

/* ---- STAGE 1: RED FLAGS -------------------------------------------------
   These run first and are never skipped, no matter what Stage 2 says.
   Mirrors real ED triage: rule out the dangerous things before ranking
   the likely things. Each rule fires when ALL of its `when` tests pass. */
window.RED_FLAGS = [
  {
    condition: "aortic_dissection",
    name: "Aortic Dissection",
    message: "Sudden tearing-quality pain (or sudden pain radiating to the back with unequal arm blood pressures) is the classic dissection pattern.",
    when: { all: [
      { field: "onset", is: ["sudden"] },
      { any: [
        { field: "quality", is: ["tearing"] },
        { all: [ { flag: "rad.back" }, { flag: "exam.unequal_bp" } ] }
      ]}
    ]}
  },
  {
    condition: "pulmonary_embolism",
    name: "Pulmonary Embolism",
    message: "Sudden pleuritic pain in someone with clot risk factors (DVT/clotting history, cancer, or recent surgery/immobility) must be treated as PE until excluded.",
    when: { all: [
      { field: "onset", is: ["sudden"] },
      { flag: "pos.pleuritic" },
      { any: [ { flag: "hist.clotting" }, { flag: "hist.cancer" }, { flag: "hist.surgery_immobility" } ] }
    ]}
  },
  {
    condition: "heart_attack",
    name: "Heart Attack / ACS",
    message: "Exertional pressure-type pain radiating to the arm or jaw in a patient with cardiac risk factors is acute coronary syndrome until proven otherwise.",
    when: { all: [
      { field: "quality", is: ["pressure"] },
      { any: [ { flag: "rad.arm" }, { flag: "rad.jaw" } ] },
      { field: "exertion", is: ["exertion"] },
      { any: [ { flag: "hist.smoking" }, { flag: "hist.cardiac" }, { num: "age", gte: 50 } ] }
    ]}
  },
  {
    condition: "pneumothorax",
    name: "Pneumothorax",
    message: "Sudden one-sided pain with breathlessness in a young male or a patient with known lung disease fits spontaneous pneumothorax.",
    when: { all: [
      { field: "onset", is: ["sudden"] },
      { flag: "pos.one_sided" },
      { flag: "assoc.sob" },
      { any: [
        { all: [ { field: "sex", is: ["male"] }, { num: "age", lt: 40 } ] },
        { flag: "hist.lung_disease" }
      ]}
    ]}
  },
  {
    condition: null, /* tamponade isn't in the v1 ranked list yet — flag only */
    name: "Cardiac Tamponade",
    message: "Low blood pressure with distended neck veins suggests tamponade physiology (two of Beck's triad). Needs immediate evaluation with bedside echo.",
    when: { all: [
      { num: "vitals.sbp", lt: 90 },
      { flag: "exam.neck_veins" }
    ]}
  }
];

/* ---- STAGE 2: CONDITION FEATURE PROFILES --------------------------------
   Feature descriptions and confirming tests follow standard clinical
   teaching (UpToDate/Isabel-style classic presentations). Urgency levels:
   "emergent" | "urgent" | "routine". */
window.CONDITIONS = [
  {
    id: "heart_attack",
    name: "Heart Attack / Acute Coronary Syndrome",
    urgency: "emergent",
    confirming_test: "EKG + serial troponin",
    features: [
      { desc: "pressure/squeezing quality", when: { field: "quality", is: ["pressure"] } },
      { desc: "radiates to arm, jaw, or shoulder", when: { any: [ { flag: "rad.arm" }, { flag: "rad.jaw" }, { flag: "rad.shoulder" } ] } },
      { desc: "brought on by exertion", when: { field: "exertion", is: ["exertion"] } },
      { desc: "diaphoresis (sweating)", when: { flag: "assoc.diaphoresis" } },
      { desc: "nausea", when: { flag: "assoc.nausea" } },
      { desc: "shortness of breath", when: { flag: "assoc.sob" } },
      { desc: "cardiac risk factors (smoking, cardiac history, or age ≥ 50)", when: { any: [ { flag: "hist.smoking" }, { flag: "hist.cardiac" }, { num: "age", gte: 50 } ] } }
    ],
    against: [
      { desc: "pain reproducible by pressing on the chest wall", when: { flag: "pos.palpation" } },
      { desc: "pain lasting only seconds at a time", when: { field: "duration", is: ["brief"] } }
    ]
  },
  {
    id: "aortic_dissection",
    name: "Aortic Dissection",
    urgency: "emergent",
    confirming_test: "CT angiography of the chest (or TEE if unstable)",
    features: [
      { desc: "sudden onset", when: { field: "onset", is: ["sudden"] } },
      { desc: "tearing/ripping quality", when: { field: "quality", is: ["tearing"] } },
      { desc: "radiates to the back or between the shoulder blades", when: { any: [ { flag: "rad.back" }, { flag: "rad.shoulder" } ] } },
      { desc: "unequal blood pressure between arms", when: { flag: "exam.unequal_bp" } },
      { desc: "connective tissue disease (e.g. Marfan)", when: { flag: "hist.connective_tissue" } },
      { desc: "dizziness or syncope", when: { flag: "assoc.dizziness" } }
    ],
    against: []
  },
  {
    id: "pulmonary_embolism",
    name: "Pulmonary Embolism",
    urgency: "emergent",
    confirming_test: "D-dimer if low risk; CT pulmonary angiogram if elevated or high risk",
    features: [
      { desc: "sudden onset", when: { field: "onset", is: ["sudden"] } },
      { desc: "pleuritic pain (worse with breathing)", when: { flag: "pos.pleuritic" } },
      { desc: "shortness of breath", when: { flag: "assoc.sob" } },
      { desc: "clot risk factors (DVT/clotting history, cancer, recent surgery/immobility)", when: { any: [ { flag: "hist.clotting" }, { flag: "hist.cancer" }, { flag: "hist.surgery_immobility" } ] } },
      { desc: "heart rate ≥ 100", when: { num: "vitals.hr", gte: 100 } },
      { desc: "oxygen saturation below 94%", when: { num: "vitals.spo2", lt: 94 } },
      { desc: "dizziness or syncope", when: { flag: "assoc.dizziness" } }
    ],
    against: [
      { desc: "pain reproducible by pressing on the chest wall", when: { flag: "pos.palpation" } }
    ]
  },
  {
    id: "pneumothorax",
    name: "Pneumothorax",
    urgency: "emergent",
    confirming_test: "Upright chest X-ray (bedside ultrasound in unstable patients)",
    features: [
      { desc: "sudden onset", when: { field: "onset", is: ["sudden"] } },
      { desc: "sharp/stabbing quality", when: { field: "quality", is: ["sharp"] } },
      { desc: "one-sided pain", when: { flag: "pos.one_sided" } },
      { desc: "pleuritic pain (worse with breathing)", when: { flag: "pos.pleuritic" } },
      { desc: "shortness of breath", when: { flag: "assoc.sob" } },
      { desc: "young male or known lung disease", when: { any: [ { all: [ { field: "sex", is: ["male"] }, { num: "age", lt: 40 } ] }, { flag: "hist.lung_disease" } ] } },
      { desc: "oxygen saturation below 94%", when: { num: "vitals.spo2", lt: 94 } }
    ],
    against: []
  },
  {
    id: "pericarditis",
    name: "Pericarditis",
    urgency: "urgent",
    confirming_test: "EKG (diffuse ST elevation + PR depression) + echocardiogram",
    features: [
      { desc: "sharp/stabbing quality", when: { field: "quality", is: ["sharp"] } },
      { desc: "worse lying down, better sitting forward", when: { flag: "pos.worse_lying" } },
      { desc: "pleuritic pain (worse with breathing)", when: { flag: "pos.pleuritic" } },
      { desc: "recent viral illness", when: { flag: "assoc.viral" } },
      { desc: "fever", when: { flag: "assoc.fever" } }
    ],
    against: []
  },
  {
    id: "gerd",
    name: "GERD / Acid Reflux",
    urgency: "routine",
    confirming_test: "Trial of antacid/PPI; endoscopy only if alarm features",
    features: [
      { desc: "burning quality", when: { field: "quality", is: ["burning"] } },
      { desc: "worse lying down", when: { flag: "pos.worse_lying" } },
      { desc: "history of GERD/reflux", when: { flag: "hist.gerd" } },
      { desc: "episodic pattern", when: { field: "duration", is: ["episodic"] } },
      { desc: "occurs at rest (not tied to exertion)", when: { field: "exertion", is: ["rest"] } },
      { desc: "nausea", when: { flag: "assoc.nausea" } }
    ],
    against: [
      { desc: "brought on by exertion", when: { field: "exertion", is: ["exertion"] } }
    ]
  },
  {
    id: "costochondritis",
    name: "Costochondritis",
    urgency: "routine",
    confirming_test: "Clinical exam — reproducible chest-wall tenderness; imaging usually unnecessary",
    features: [
      { desc: "sharp/stabbing quality", when: { field: "quality", is: ["sharp"] } },
      { desc: "pain reproducible by pressing on the chest wall", when: { flag: "pos.palpation" } },
      { desc: "worse with breathing or movement", when: { flag: "pos.pleuritic" } },
      { desc: "recent trauma, strain, or forceful coughing", when: { any: [ { flag: "assoc.trauma" }, { flag: "assoc.cough" } ] } },
      { desc: "one-sided, localized pain", when: { flag: "pos.one_sided" } }
    ],
    against: []
  },
  {
    id: "panic_anxiety",
    name: "Panic / Anxiety",
    urgency: "routine",
    confirming_test: "Diagnosis of exclusion — rule out cardiac and PE causes first; clinical interview",
    features: [
      { desc: "sudden onset", when: { field: "onset", is: ["sudden"] } },
      { desc: "palpitations", when: { flag: "assoc.palpitations" } },
      { desc: "dizziness", when: { flag: "assoc.dizziness" } },
      { desc: "shortness of breath", when: { flag: "assoc.sob" } },
      { desc: "brief or episodic pattern", when: { field: "duration", is: ["brief", "episodic"] } },
      { desc: "occurs at rest", when: { field: "exertion", is: ["rest"] } },
      { desc: "age under 45", when: { num: "age", lt: 45 } }
    ],
    against: [
      { desc: "brought on by exertion", when: { field: "exertion", is: ["exertion"] } }
    ]
  }
];
