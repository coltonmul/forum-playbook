/* Forum Playbook app beta signup: the question set. VERSION 1.0.0 (2026-09-22)
   THIS FILE IS THE CONTENT. Edit here, nowhere else. The signup page renders whatever is in
   QUESTIONS, the admin page (forum-playbook-beta.pages.dev/admin) tallies the ranked features from
   it, and the backend stores whatever comes back as JSON, so adding, cutting, or rewording a
   question needs no other change. The EO House survey's rule, same shape.

   Types: line (one line of text), email, rank (tick as many as you like, in order; the order
   is kept), block (a box for longer text).
   target: 'name' or 'email' sends that answer as the top-level name or email field. */
const QUESTIONS = [
  {
    id: 'name', type: 'line', required: true, target: 'name',
    section: 'You',
    q: 'Your name',
    placeholder: 'First and last name', autocomplete: 'name'
  },
  {
    id: 'email', type: 'email', required: true, target: 'email',
    q: 'The email address tied to your Apple ID',
    help: 'The account you use for iCloud and the App Store. This is the address your TestFlight beta invite will be sent to, so use the one on your iPhone.',
    placeholder: 'you@example.com', autocomplete: 'email', testflight: true
  },
  {
    id: 'chapter', type: 'line', required: true,
    q: 'Your chapter',
    placeholder: 'For example, EO Nashville'
  },
  {
    id: 'forum', type: 'line', required: true,
    q: 'Your forum number or name',
    placeholder: 'For example, Forum 14'
  },
  {
    id: 'features', type: 'rank', required: true,
    section: 'What you want most',
    q: 'Which features are you most interested in?',
    help: 'Tick them in order. Your first tick is your number one, your second tick is your number two, and so on. Tick as many as you like. Tap one again to take it out.',
    options: [
      'Ready access to documents: constitution, 5% reflections, coaching worksheets, and more',
      'Better organization of retreat details: agendas, finances, and more',
      'A custom forum timer suited to forum nuance, with clear visual indicators',
      'Automatic timers based on uploaded or template agendas',
      'Automatic reminders for 5% reflections, 1 to 2 days before forum',
      'Automatic reminders for coaching, presenting, meeting location, and more',
      'Automatic calendar invites',
      'Templates and guides for alternative presentation types',
      'A discussion board for connection and check-ins throughout the month',
      'Ways to save and chart 5% reflections to spot themes over time',
      'Storage and updates for parking lots',
      'A randomized topic picker based on recent 5% reflections and parking lots'
    ]
  },
  {
    id: 'forum_mates', type: 'block', required: false,
    section: 'Bring your forum',
    q: 'The email addresses of your fellow forum mates',
    help: "These people will still have to accept their own invite. They will just be whitelisted for the forum profile that is created for you, so as long as they sign up using that email address, they will be placed directly into your forum's profile with access to all of the resources for your specific forum.",
    placeholder: 'One per line, or separated by commas', rows: 4
  },
  {
    id: 'notes', type: 'block', required: false,
    section: 'In your own words',
    q: 'Anything else you want the app to do?',
    help: 'What would make it a must-have for your forum? What are we missing?',
    placeholder: 'Type as much or as little as you want.', rows: 4
  }
];
