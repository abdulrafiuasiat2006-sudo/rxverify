import { DocNowTriageResult } from '../types';
import { DOCNOW_DOCTORS } from '../data/docNowData';

export function runDocNowSymptomTriage(query: string): DocNowTriageResult {
  const q = query.toLowerCase();

  // Cardiac / Severe Chest symptoms (Urgent)
  if (q.includes('chest') || q.includes('heart') || q.includes('palpitation') || q.includes('cardiac') || q.includes('angina')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('cardio') || d.specialty.toLowerCase().includes('general'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Urgent',
      clinicalSummary: 'Chest symptoms require immediate cardiovascular evaluation to rule out acute ischemic syndrome, pericarditis, or hypertensive crisis.',
      possibleCauses: ['Angina Pectoris / Ischemic Heart Disease', 'Costochondritis / Musculoskeletal Chest Wall Strain', 'Sinus Tachycardia or Arrhythmia', 'Gastroesophageal Reflux Spasm'],
      recommendedSpecialty: 'Cardiology',
      homeCareTips: [
        'Rest in an upright, relaxed seated position with loosened clothing.',
        'Avoid strenuous exertion, caffeine, and sudden stress triggers.',
        'If accompanied by left arm radiation, cold sweats, or breathlessness, seek emergency hospital triage immediately.'
      ],
      warningSigns: [
        'Radiating pain to jaw, back, neck, or left arm',
        'Profuse cold sweating and lightheadedness',
        'Severe shortness of breath at rest'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Headaches / Migraine / Neurological
  if (q.includes('headache') || q.includes('migraine') || q.includes('dizzy') || q.includes('vertigo') || q.includes('seizure') || q.includes('numb')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('neuro') || d.specialty.toLowerCase().includes('general'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Moderate',
      clinicalSummary: 'Unilateral or severe throbbing headache patterns often indicate migraine with or without aura, tension cephalalgia, or elevated intracranial pressure.',
      possibleCauses: ['Acute Migraine Cephalea', 'Cervicogenic or Tension Headache', 'Dehydration / Electrolyte Imbalance', 'Sinus Congestion Headache'],
      recommendedSpecialty: 'Neurology',
      homeCareTips: [
        'Rest in a quiet, dimly lit, cool room.',
        'Apply a cold compress across forehead or temples.',
        'Ensure gentle hydration with oral rehydration solution or water.',
        'Avoid screen exposure and strong sensory perfumes.'
      ],
      warningSigns: [
        'Sudden "thunderclap" headache reaching max intensity in seconds',
        'Stiff neck accompanied by high fever or photophobia',
        'Focal weakness or unilateral facial drooping'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Dermatology / Skin
  if (q.includes('skin') || q.includes('rash') || q.includes('itch') || q.includes('eczema') || q.includes('burn') || q.includes('dermat')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('derm'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Routine',
      clinicalSummary: 'Dermatological presentations with itching or erythema commonly represent contact dermatitis, fungal dermatomycoses, or atopic eczema flare.',
      possibleCauses: ['Allergic Contact Dermatitis', 'Atopic Eczema / Xerosis Cutis', 'Tinea Corporis / Fungal Infection', 'Urticaria (Hives) Reaction'],
      recommendedSpecialty: 'Dermatology',
      homeCareTips: [
        'Do not scratch to prevent secondary bacterial superinfections.',
        'Apply cool, clean water compresses or fragrance-free emollient moisturizer.',
        'Avoid harsh antiseptic medicated soaps containing aggressive phenols.'
      ],
      warningSigns: [
        'Rapidly spreading rash with facial swelling or airway tightness',
        'Blistering involving mucous membranes (eyes, lips, mouth)',
        'Pus-filled lesions with accompanying fever'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Orthopedics / Back / Bone / Joint
  if (q.includes('bone') || q.includes('joint') || q.includes('spine') || q.includes('back') || q.includes('knee') || q.includes('fracture') || q.includes('sprain') || q.includes('ortho')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('ortho'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Moderate',
      clinicalSummary: 'Musculoskeletal pain affecting joints or spinal axial columns suggests ligamentous sprain, discogenic strain, or mechanical facet arthropathy.',
      possibleCauses: ['Acute Lumbar Strain / Myofascial Spasm', 'Intervertebral Disc Herniation / Sciatica', 'Osteoarthritis / Synovitis', 'Tendonitis or Meniscal Strain'],
      recommendedSpecialty: 'Orthopedic Surgery & Traumatology',
      homeCareTips: [
        'Practice R.I.C.E. (Rest, Ice for 48h, Compression, Elevation) for joint injuries.',
        'Maintain ergonomic posture and avoid heavy bending or lifting.',
        'Perform gentle isometric stretches only if pain is not sharp.'
      ],
      warningSigns: [
        'Inability to bear weight on the limb',
        'Loss of bladder or bowel sphincter control (Cauda Equina warning)',
        'Progressive progressive numbness or foot drop'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Pediatrics / Child
  if (q.includes('child') || q.includes('baby') || q.includes('infant') || q.includes('colic') || q.includes('pediatric') || q.includes('toddler')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('paed') || d.specialty.toLowerCase().includes('ped'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Urgent',
      clinicalSummary: 'Pediatric illnesses can evolve rapidly. Early clinical assessment ensures timely intervention for febrile illnesses or dehydration.',
      possibleCauses: ['Infantile Colic & Gas Entrapment', 'Viral Upper Respiratory Tract Infection', 'Teething-Related Distress', 'Acute Gastroenteritis'],
      recommendedSpecialty: 'Pediatrics',
      homeCareTips: [
        'Maintain frequent hydration with breast milk, formula, or pediatrician-guided ORS.',
        'Monitor temperature regularly using an accurate digital thermometer.',
        'Keep the infant upright for 20 minutes following feeds.'
      ],
      warningSigns: [
        'Temperature exceeding 38.5C in infants under 3 months',
        'Lethargy, extreme floppiness, or weak cry',
        'Sunken fontanelle, dry diapers for over 6 hours, or rapid labored breathing'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Mental Health / Stress / Insomnia
  if (q.includes('sleep') || q.includes('insomnia') || q.includes('anxiety') || q.includes('depression') || q.includes('stress') || q.includes('panic') || q.includes('mental')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('mental') || d.specialty.toLowerCase().includes('psych'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Routine',
      clinicalSummary: 'Chronic sleep disruption and heightened autonomic arousal benefit from evidence-based psychotherapeutic assessment and sleep hygiene.',
      possibleCauses: ['Generalized Anxiety-Induced Insomnia', 'Circadian Phase Disruption', 'Acute Stress Reaction / Burnout', 'Secondary Restless Leg Discomfort'],
      recommendedSpecialty: 'Mental Health',
      homeCareTips: [
        'Maintain consistent sleep-wake cycles even on weekends.',
        'Implement 4-7-8 diaphragmatic breathing when anxious.',
        'Eliminate blue-light screens and caffeine at least 4 hours before bedtime.'
      ],
      warningSigns: [
        'Persistent thoughts of hopelessness or self-harm',
        'Panic attacks lasting over 30 minutes with severe disorientation',
        'Complete inability to sleep for consecutive days leading to confusion'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // Dental / Oral
  if (q.includes('tooth') || q.includes('teeth') || q.includes('dental') || q.includes('gum') || q.includes('jaw') || q.includes('mouth')) {
    const matchedDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('dent'));
    return {
      symptomQuery: query,
      urgencyLevel: 'Moderate',
      clinicalSummary: 'Throbbing dental pain indicates pulpal inflammation, periapical abscess, or dentinal hypersensitivity requiring targeted dental care.',
      possibleCauses: ['Acute Irreversible Pulpitis', 'Periapical Periodontal Abscess', 'Impacted Third Molar (Wisdom Tooth) Pericoronitis', 'Dry Socket (Alveolar Osteitis)'],
      recommendedSpecialty: 'Dental Surgery',
      homeCareTips: [
        'Rinse gently with warm saline solution (half teaspoon salt in warm water).',
        'Avoid extremes of hot, icy cold, or sweet food triggers.',
        'Do NOT place aspirin or alcohol directly onto the gum tissue.'
      ],
      warningSigns: [
        'Swelling spreading into the cheek, eye floor, or submandibular neck space',
        'Difficulty swallowing saliva or opening mouth (trismus)',
        'Spiking fever with facial swelling'
      ],
      matchedDoctorIds: matchedDocs.map(d => d.id),
    };
  }

  // General default fallback
  const defaultDocs = DOCNOW_DOCTORS.filter(d => d.specialty.toLowerCase().includes('general') || d.specialty.toLowerCase().includes('internal'));
  return {
    symptomQuery: query,
    urgencyLevel: 'Moderate',
    clinicalSummary: 'General systemic symptoms are best evaluated through a comprehensive primary care review, physical check, and targeted lab investigations.',
    possibleCauses: ['Viral or Bacterial Infection', 'Malaria Parasitemia (endemic screening indicated)', 'Metabolic Fatigue or Dehydration', 'Allergic Response'],
    recommendedSpecialty: 'General Physician',
    homeCareTips: [
      'Stay well hydrated with clean water and electrolyte fluids.',
      'Record daily temperature readings and symptoms progression.',
      'Get ample rest and eat light, easily digestible meals.'
    ],
    warningSigns: [
      'High persistent fever unresponsive to antipyretics for >48 hours',
      'Persistent vomiting preventing oral medication retention',
      'Sudden confusion, severe weakness, or labored respiration'
    ],
    matchedDoctorIds: defaultDocs.map(d => d.id),
  };
}
