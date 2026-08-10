// FORUM PLAYBOOK homepage mockups - shared REAL data snapshot
// Baked 2026-08-10 from the live Drive library + YouTube playlist so the
// mockups show true content. Types: doc | sheet | pdf | img | folder | local
const FP_DATA = {
  sections: [
    {
      key: 'exercises', name: 'Exercises & Guides', icon: 'compass',
      blurb: 'Facilitation tools for the meeting itself',
      files: [
        { id: 'LOCAL-OC3', name: 'Open Coaching', ver: 'v3.0', type: 'local', isNew: true,
          thumb: 'open-coaching-preview.png',
          html: '/one-pagers/open-coaching-v3.0.html', pdf: '/one-pagers/open-coaching-v3.0.pdf' },
        { id: '18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc', name: 'Clearing Round and Repair Process', ver: 'v1.1', type: 'doc' },
        { id: '1MoPQ-_1KhR9SuBY2YfhWi3ncHgkOA1XII7a3Pc6rR_0', name: "Planned Deep Dive Coach's Worksheet", type: 'doc' },
        { id: '1vM_0sAGTdZUJiV2Wgt2LUVP-g17JOEP6D6lmtLCeXbo', name: 'Planned Deep Dive Worksheet', type: 'doc' },
        { id: '180OcFaoSllXzoYsemG841_qS03j4CJRpq-NZiIn2Ft0', name: 'Monthly 5% Reflection Worksheet', type: 'doc' },
        { id: '1i8YogTRmnbei2EK8dwLdYHgiS9T4oNdG', name: 'Emotions Wheel', type: 'pdf' },
        { id: '1jLGoIvmitdankrk89BiJ3ZQFtpmm4d6Z', name: 'Johari Window', type: 'pdf' },
        { id: '1QKtI3M8ADXmXY2tPJKJRkmUxEwA-fcDU', name: 'Q2 Parking Lot Builder', type: 'pdf' },
        { id: '1TUM8UFxUHUW-VSdujsoX9ji8FhDjWFBP', name: 'Alternate Formats for Various Topics', type: 'doc' },
        { id: '1Doj3eolN57lk8fSwatNplUuP6pgoz4q0', name: 'EO Business Disclosures: Doing Business Together', type: 'doc' },
        { id: '1kOtl3QvWYwXJvL7u67X8vca09DZHJ699ZmbL3EnRyT8', name: 'SLP Forum Constitution Template', type: 'doc' },
        { id: '1qgfKmYp7__17gm8dj9UMdMlf8RjoTY9X', name: 'Alternative Impromptu and Presentation Formats', type: 'folder' }
      ]
    },
    {
      key: 'fivepct', name: '5% Worksheet Variations', icon: 'percent',
      blurb: 'The monthly update form, in every flavor',
      files: [
        { id: '16LqU_hFwyaNSFHeXq_OUSCuxiTke4hktqXto0ZfmbBg', name: '5% Reflection Worksheet, EO Nashville 2026 v2', type: 'doc' },
        { id: '1mKP4XbxaXtaCPA6Ok9exMSjMWen2dMec', name: '5% Update Form with Prompts (2023)', type: 'pdf' },
        { id: '127TYsQH03rH35koqwjQm5fgQ6X9wRVJj', name: 'Archived Templates', type: 'folder' }
      ]
    },
    {
      key: 'retreat', name: 'Retreat Exercises', icon: 'mountain',
      blurb: 'Everything for the offsite',
      files: [
        { id: '121P9T1lXzSt7vs3W6RnugupovSkdeHUJ', name: 'Creating Powerful Forum Retreats', type: 'pdf' },
        { id: '1IuSk1c0GUxuFtZxOnHgqBll_9NGVdzBV', name: 'Happiness Lifeline: Facilitator Guide', type: 'pdf' },
        { id: '1hkI9YiX2OKSGjbBrKa66cFoE3kPaHNrF', name: 'Happiness Lifeline: Overview', type: 'pdf' },
        { id: '15pAIWknAriZP-kq7YPOnyZPy9loBGA3C', name: 'Lifeline Form (up to 50)', type: 'pdf' },
        { id: '19N8JREWmcDGCSRC-RlR0eCpFTUpu0AS1', name: 'Lifeline Form (up to 60)', type: 'pdf' },
        { id: '12kBBQK6u1zyIR-eXiu30V73sNGOxJRQ4', name: 'Life Timeline Grid to 40', type: 'pdf' },
        { id: '1pFRCVdcl31RXY6Cypnd6F-ESUIda15qh', name: 'Life Timeline Grid to 50', type: 'pdf' },
        { id: '1sCC428iqbg71z0bv51MyjtEfXQntZsf6', name: 'Life Timeline Grid to 60', type: 'pdf' },
        { id: '11ThoHZlh3yfTP7uC2dMRGuGSvIhmGyv4', name: 'Parking Lot Builder: Interactive', type: 'pdf' },
        { id: '1ODqOcqHqlfrqwrLd37LSicpEA5VhTi-n', name: 'Parking Lot Builder: Printable', type: 'pdf' },
        { id: '1OzbfHPDO1s_MQbF0dDQSt_TlG7_tf-E3', name: '3Bs Annual Forum Alignment Worksheet', type: 'pdf' },
        { id: '1gKUoFWxFT-q2BLWKN9y9qzoIaYEi2PPV', name: '3Bs Overview', type: 'pdf' },
        { id: '1rhSFymRov3BcH9K4j2gnItNbiesBaxsu', name: '3x3 Exercise', type: 'pdf' },
        { id: '1JEFiDhcdf0AHvZHLSTdGx1P25uqp_yY9', name: '5-5-5 Factors of My Life', type: 'pdf' },
        { id: '19bQDx8CAcs14MkLOKP4S2vUQBoaFq9rN', name: 'Self-Reflection Retreat Exercises', type: 'pdf' },
        { id: '1VvRNpNLo3WkPokpX_smXbc4uNV0ZLqaE', name: 'Stick Man', type: 'pdf' },
        { id: '1d5UOPKzapA9YpuHKwW0o7cigAmlXivT1', name: 'Lifeline Guide and Instructions', type: 'img' }
      ]
    },
    {
      key: 'official', name: 'Official EO Global Tools', icon: 'lock', restricted: true,
      blurb: 'Restricted: access through the EO member portal',
      files: []
    }
  ],
  core: [
    { title: 'Forum Timer', sub: 'MEETING TIMER · WEB APP', icon: 'timer', links: [{ label: '▶ Open the Timer', href: '/timer' }] },
    { title: 'Nashville Forum Constitution', sub: 'GOOGLE DOC · FOUNDATION', icon: 'flag', fileRef: '1h2AYwSQ0HcMY3EpF5L8kq1ZrZA63kwiT-J5w7BtcmWQ', type: 'doc' },
    { title: 'Forum Organizer Spreadsheet', sub: 'AGENDA · SCHEDULE · PARKING LOT', icon: 'sheet', fileRef: '1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg', type: 'sheet' },
    { title: 'Official EO Docs', sub: 'EONETWORK.ORG · LOGIN REQUIRED', icon: 'lock', links: [{ label: '↗ Forum & Mod Docs', href: 'https://member.eonetwork.org/member/forum/for-forum-moderators' }] }
  ],
  videos: [
    { id: 'KHSiGtly77s', title: 'How to Plan a Great Retreat' },
    { id: 'eb3_5JwuUBA', title: 'How to Fill Out Your Monthly 5% Reflection' },
    { id: 'IGaRXHojs-A', title: 'Parking Lot Walkthrough and Template' },
    { id: 'Fo5vlr2MYqM', title: 'How to Do Clearing Rounds' },
    { id: 'cbdK37JesKY', title: 'Forum Stir Fry / Open Season: Pros vs Cons' },
    { id: 'sB9clzAgiRk', title: 'Finding Belonging as an Entrepreneur' }
  ],
  podcasts: [
    { id: 'Uv6KdABlhWw', title: 'How to Do a Deep Dive' },
    { id: 'Oqa-YI_aIdM', title: 'Coaching for Deep Dives' },
    { id: 'u_YEH573U2o', title: 'Participating in a Deep Dive' }
  ],
  tasks: [
    { key: 'meeting', label: 'Run this month’s meeting', icon: 'clock',
      hint: 'Agenda, clearing, parking lot, timer',
      fileIds: ['1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg', '18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc', '1QKtI3M8ADXmXY2tPJKJRkmUxEwA-fcDU', '1TUM8UFxUHUW-VSdujsoX9ji8FhDjWFBP'], videoIds: ['Fo5vlr2MYqM', 'IGaRXHojs-A'] },
    { key: 'coach', label: 'Coach a deep dive', icon: 'compass',
      hint: 'Full EQ coaching, plus the light IQ version',
      fileIds: ['LOCAL-OC3', '1MoPQ-_1KhR9SuBY2YfhWi3ncHgkOA1XII7a3Pc6rR_0', '1vM_0sAGTdZUJiV2Wgt2LUVP-g17JOEP6D6lmtLCeXbo', '1i8YogTRmnbei2EK8dwLdYHgiS9T4oNdG'], videoIds: ['Uv6KdABlhWw', 'Oqa-YI_aIdM'] },
    { key: 'fivepct', label: 'Do my 5% prep', icon: 'percent',
      hint: 'The monthly form, with prompts',
      fileIds: ['180OcFaoSllXzoYsemG841_qS03j4CJRpq-NZiIn2Ft0', '16LqU_hFwyaNSFHeXq_OUSCuxiTke4hktqXto0ZfmbBg', '1mKP4XbxaXtaCPA6Ok9exMSjMWen2dMec'], videoIds: ['eb3_5JwuUBA'] },
    { key: 'retreat', label: 'Plan a retreat', icon: 'mountain',
      hint: 'Budgets, agendas, the exercises that land',
      fileIds: ['121P9T1lXzSt7vs3W6RnugupovSkdeHUJ', '1IuSk1c0GUxuFtZxOnHgqBll_9NGVdzBV', '1gKUoFWxFT-q2BLWKN9y9qzoIaYEi2PPV', '1rhSFymRov3BcH9K4j2gnItNbiesBaxsu'], videoIds: ['KHSiGtly77s'] },
    { key: 'health', label: 'Strengthen forum health', icon: 'pulse',
      hint: 'Constitutions, clearing, doing business together',
      fileIds: ['1h2AYwSQ0HcMY3EpF5L8kq1ZrZA63kwiT-J5w7BtcmWQ', '1kOtl3QvWYwXJvL7u67X8vca09DZHJ699ZmbL3EnRyT8', '18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc', '1Doj3eolN57lk8fSwatNplUuP6pgoz4q0'], videoIds: ['cbdK37JesKY'] },
    { key: 'role', label: 'Hand someone their role', icon: 'users',
      hint: 'Role Kits: moderator, presenter, timekeeper',
      roleKits: true, fileIds: ['1h2AYwSQ0HcMY3EpF5L8kq1ZrZA63kwiT-J5w7BtcmWQ'], videoIds: ['sB9clzAgiRk'] }
  ],
  roleKits: ['Moderator', 'Presenter', 'Timekeeper', 'Participant', 'Retreat Planner']
};
// index for cross-referencing
FP_DATA.fileById = {};
FP_DATA.sections.forEach(function (s) { s.files.forEach(function (f) { f.section = s.name; FP_DATA.fileById[f.id] = f; }); });
FP_DATA.core.forEach(function (c) {
  if (c.fileRef && !FP_DATA.fileById[c.fileRef]) {
    var f = { id: c.fileRef, name: c.title, type: c.type, section: 'Core Resources' };
    FP_DATA.fileById[c.fileRef] = f;
  }
});
window.FP_DATA = FP_DATA;
