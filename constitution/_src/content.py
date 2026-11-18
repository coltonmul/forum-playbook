# content.py: the Nashville Forum Constitution Template, the ONE source for the page, the Markdown, the Word
# document and the PDF (tools/build-constitution.py renders all four from this file).
#
# The rule text is the chapter template as regrouped by topic (sections 01-16, appendices A-B), word for word.
# Nothing here is rewritten: change a rule only when the chapter template changes, and bump VERSION when it does.
#
# Inline marks the builder understands, in any string:
#   **bold**            bold
#   [text](#anchor)     a link to another topic on the page (plain text in the Markdown, Word and PDF)
#   {{blank}}           a fill-in blank (an underlined gap on the page, ________ in the files)
#   {{blank-short}}     a short fill-in blank (two digits of a year)
#
# Blocks:
#   ("lead", s)  ("p", s)  ("h3", s)  ("ul", [s, ...])  ("ol", [s, ...])
#   ("box", tone, heading, [s, ...])           tone: spirit | hard | gap
#   ("kv", caption or None, [(term, s), ...])  a two-column table whose first column names the row
#   ("table", caption or None, head, rows)     head: list of column names; a cell is s, or (s, kind), or (s, kind, colspan)
#                                              kind: n (numbers) | fine | none | miss | out | ok | th (names the row)
#   ("sig", count)                             signature lines
#   ("roles", [role, ...])                     the role roster, a name to write beside each role
#   ("roster", count)                          the member roster, name and business

VERSION = "V2026.11.18"
TITLE = "Nashville Forum Constitution Template"
MOTTO = "Clear is kind and kind is clear."
CREDIT = "Nashville Forum Constitution Template · " + VERSION + " · A Forum Playbook resource by Colton Mulligan · forumplaybook.com"
MD_CREDIT = "Nashville Forum Constitution Template " + VERSION + ". A Forum Playbook resource by Colton Mulligan. forumplaybook.com"

SECTIONS = [
    dict(id="why", num="01", toc="Why this exists", title="Reason and intention", icon="compass", blocks=[
        ("lead", "Clear is kind and kind is clear."),
        ("p", "We acknowledge that healthy forums have clear expectations among members and follow those expectations without exception. We all agree that in order to remain peers, and to honor trust and respect, **the constitution trumps personal preferences or exceptions.**"),
        ("p", "We honor this constitution because we acknowledge that policies still allow for us to be human, while also maintaining fairness for all members of the group."),
        ("box", "spirit", "Review cadence", ["This constitution is reviewed annually at the retreat, including reaffirming or reassigning forum roles."]),
    ]),
    dict(id="forum", num="02", toc="The forum", title="The forum", icon="users-three", blocks=[
        ("kv", "Membership at a glance", [
            ("Forum", "Nashville Forum #{{blank}}"),
            ("Fiscal year", "July 1 to June 30, the typical EO fiscal year. Attendance counting and role terms both run on it."),
            ("Size", "**8 members**, unless changed by a unanimous vote of the forum. Below 8, the open spots are considered available and the forum is open to adding new members."),
            ("New members", "Must meet the **unanimous consent** of the group."),
            ("Resigning members", "Are asked to make an exit presentation to the entire forum."),
            ("Preparation", "Members commit to be prepared for each forum meeting."),
        ]),
        ("p", "The member roster for the year is in [Appendix A](#appendix-a)."),
    ]),
    dict(id="meeting", num="03", toc="The meeting", title="The meeting", icon="calendar-check", blocks=[
        ("kv", "The standard meeting", [
            ("Frequency", "10 to 12 meetings per year including the retreat."),
            ("Length", "Approximately 5 hours."),
            ("Standard time", "**1:00 PM to 6:00 PM.**"),
            ("1:00 to 5:00 PM", "Formal agenda and forum meeting."),
            ("5:00 to 6:00 PM", "Social hour and happy hour. This is part of the meeting."),
            ("6:00 PM and after", "Dinner. Strongly encouraged but optional. Incurs no absence and no fine."),
            ("SAP visits", "Same meeting time, same fines for tardiness."),
        ]),
        ("table", "Standard formal agenda", ["Block", "Time"], [
            ["Moderator: one word open and reminder of confidentiality", ("2 min", "n")],
            ["Clearing round", ("5 min", "n")],
            ["5% reflections from members, including updates and transition time", ("60 to 90 min", "n")],
            ["Break", ("5 to 10 min", "n")],
            ["Planned presentation", ("45 to 60 min", "n")],
            ["Break", ("5 to 10 min", "n")],
            ["One or two impromptu presentations", ("20 to 30 min each", "n")],
            ["Housekeeping: next location, host, presenter, coach, next SAP selection", ("as needed", "n")],
            ["Upcoming chapter events, regional and global updates", ("5 min", "n")],
        ]),
        ("h3", "Host, presenter, and coach"),
        ("kv", None, [
            ("The host is the presenter", "When the schedule is set, each meeting has a predetermined host who also serves as the presenter."),
            ("The coach", "Is the person who presented the previous month."),
            ("What gets presented", "Planned presentations should be parking lot items that are **important but not urgent**, unless another truly significant topic arises."),
            ("The host provides", "The room, booked and communicated with parking info well in advance. Snacks and drinks, capped at $50. A private space with efforts made to prevent interruptions from non-forum members."),
            ("Every meeting opens", "With a clearing round."),
        ]),
        ("h3", "Emergency meetings and rescheduling"),
        ("kv", None, [
            ("Emergency meetings", "Attend if possible. The member calling the meeting makes the final call on date, time, and length. Late and absentee fines do not apply."),
            ("Rescheduling", "The sole responsibility of the member needing the reschedule, and it must be **unanimous**. Members commit to use something other than email to coordinate: Doodle or a polling platform only. **No email threads trying to reschedule meetings**, for everyone's sanity."),
        ]),
    ]),
    dict(id="fines", num="04", toc="Attendance and fines", title="Attendance, punctuality, and fines", icon="alarm", blocks=[
        ("p", "Late is defined as not being in your seat **59 seconds** past the appointed and agreed upon start time, by the timekeeper's clock. Attendance is counted over the fiscal year, July 1 to June 30."),
        ("table", "Every fine and what it costs you", ["What happened", "Fine", "Attendance"], [
            ["Not in your seat 59 seconds past the start time", ("$100", "fine"), ("none", "none")],
            ["Leaving before the agreed upon and scheduled end time, including any meeting with a mandatory happy hour", ("$100", "fine"), ("none", "none")],
            ["Arriving **30+ minutes** late", ("$100", "fine"), ("1 miss", "miss")],
            ["Leaving **30+ minutes** early", ("$100", "fine"), ("1 miss", "miss")],
            ["5% reflection not shown at the beginning of the meeting", ("$100", "fine"), ("none", "none")],
            ["Missing a meeting", ("none", "none"), ("1 miss", "miss")],
            ["**Two misses in the fiscal year**", ("none", "none"), ("Immediate dismissal", "out")],
            ["Missing 1 day of a retreat", ("none", "none"), ("1 miss, to be avoided at all costs", "miss")],
            ["Missing a retreat, for any reason", ("an amount equal to the shared expense", "fine"), ("Dismissal", "out")],
            ["Dinner after the meeting", ("none", "none"), ("none", "ok")],
        ]),
        ("box", "spirit", "Own it", ["Each member is responsible to own their tardiness and immediately offer to pay the fine to the group, rather than waiting for the moderator or treasurer to note that you owe a fine."]),
        ("h3", "Virtual attendance"),
        ("kv", None, [
            ("Allowance", "**One virtual attendance per year.**"),
            ("When", "Extenuating circumstances only: required travel, contagious illness."),
            ("Your job", "Coordinate logistics so the meeting starts on time. Ask a forum mate to arrive early and arrange the technology so you are already in a virtual room if screen sharing will be necessary."),
        ]),
        ("h3", "Getting back in"),
        ("p", "A dismissed member can only be reinstated by a **unanimous vote** of the forum, and only if that member requests a vote to be reinstated. See [section 10](#removal)."),
    ]),
    dict(id="retreats", num="05", toc="Retreats", title="Retreats", icon="mountains", blocks=[
        ("table", "Two retreats a year", ["", "Full retreat", "Mini-retreat"], [
            [("How often", "th"), "Annually", "Annually"],
            [("How long", "th"), "4 days, 3 nights minimum", "24 to 48 hours, overnight"],
            [("Where", "th"), "Wherever the forum decides", "Within a 2 hour drive of Nashville"],
            [("Budget range", "th"), ("$2,500 to $5,000", "n"), ("$750 to $1,500", "n")],
            [("Covers", "th"), "Flights, lodging, transportation, food, basic activities", "Same"],
            [("Travel", "th"), "Members only", "The group travels to and from together"],
            [("Who comes", "th"), ("**Members only.** No family, no business partners, no spouses or significant others, so the forum can honor the exercises intended for each retreat.", "", 2)],
        ]),
        ("kv", "Best-practice agenda mix", [
            ("1/3 Forum exercises and health", "A unique deep exercise, the business, buddies and balance exercise, stop/start/continue. Plus constitution review, role decisions, and 12 month schedule setting."),
            ("1/3 Group activities", "A boat ride, touring a business, meeting up with a local forum."),
            ("1/3 Down time", "Games and cards, an extended happy hour, pool or beach time, a campfire."),
        ]),
        ("h3", "How the budget works"),
        ("ul", [
            "The budget range above is **pre-approved**. The retreat planner does not need to seek approval for every expense.",
            "Prior to retreat planning, a member can request a discussion regarding this year's budget range.",
            "The mini-retreat includes at least one group exercise targeting vulnerability, reflection, or goal setting.",
        ]),
    ]),
    dict(id="confidentiality", num="06", toc="Confidentiality and conduct", title="Confidentiality and conduct", icon="lock-key", blocks=[
        ("box", "hard", "Confidentiality, the cornerstone", [
            "Everything discussed between forum members is considered confidential in an official forum meeting, unless specified otherwise. **A breach of confidentiality results in an immediate dismissal from the forum.** This is a cornerstone value of forum and carries the highest level of importance and sensitivity.",
            "The dismissed member may request a vote to rejoin. They may attend the first part of the next meeting to explain the situation and answer questions, then step out of the room while the forum openly discusses and holds an open vote on whether to readmit. **A unanimous vote is necessary to readmit.**",
        ]),
        ("h3", "Forum Mindset, at all meetings and retreats"),
        ("kv", None, [
            ("No \"you\" statements", "Speak from your own experience."),
            ("No \"should, would, or could\" statements", "No advice, experience only."),
            ("No leading questions", "A question that contains its answer is advice wearing a disguise."),
            ("Everyone enforces it", "All members are responsible for helping to flag Forum Mindset breaks when they occur."),
        ]),
        ("kv", "Room rules", [
            ("Phones", "On airplane mode or Do Not Disturb, set aside from the table, **not in a pocket**, to avoid distractions."),
            ("Laptops and tablets", "Limited as much as possible. Any device in use has all notifications silenced and all apps closed except whatever note taking or tracking app is necessary, such as the parking lot tracker."),
            ("Alcohol and substances", "No drinking before or during monthly meetings. No indulging in judgement or attention impairing substances before a meeting."),
            ("Overindulgence", "The group is given permission to intercede if and when any forum member overindulges at any time the group is together."),
        ]),
    ]),
    dict(id="business", num="07", toc="Business between members", title="Business between members", icon="handshake", blocks=[
        ("box", "hard", "The default is no", [
            "Our forum agrees **not to do business with each other for any transaction or engagement over $1,000**. We agree not to do business for any engagement that could meaningfully impact our business or personal lives.",
            "Our forum recognizes that no one expects an engagement to go bad with a client, and the inherent risks that could pose if one member had a bad experience engaging the services of another member.",
        ]),
        ("box", "gap", "Note for forums that choose differently", [
            "Some Nashville forums have chosen disclosure-and-resolution instead of prohibition: business between members is permitted at any size, but must be disclosed when anticipated and filed with a written resolution ladder as an addendum. If your forum takes that route, replace this section deliberately rather than leaving both readings in the document.",
        ]),
    ]),
    dict(id="roles", num="08", toc="Roles", title="Roles", icon="identification-badge", blocks=[
        ("p", "Terms run 12 months, July 1 to June 30. Current holders are in [Appendix A](#appendix-a)."),
        ("table", "Who owns what", ["Role", "Owns"], [
            [("Moderator", "th"), "Organizes the calendar, sets the agenda, facilitates meetings, communicates to the chapter, and is generally responsible for forum organization and progress. **Always goes through moderator training before taking the role.** Adheres to the constitution and serves as a benevolent dictator to keep a tight ship: always prepared, agenda out in advance of each meeting, with a reminder for all members to complete their 5% reflection."],
            [("Moderator elect, Forum Mindset monitor, and calendar keeper", "th"), "Learns the concept of Forum Mindset and EO's commitment to it, and monitors compliance during meetings. Maintains the calendar spreadsheet tracking host, presenter, and coach order, and manages the calendar invites for each meeting. This duty is the indicator of the moderator's commitment and capability to lead the forum when they take over."],
            [("Treasurer", "th"), "The monetary business of the forum: the ledger of tardiness fines, retreat expenses, settling up."],
            [("Retreat planner", "th"), "Managing or delegating all aspects of planning and executing the forum's annual retreat."],
            [("Timekeeper", "th"), "Tracks allotted time during forum activities, keeps everyone aware of the intended pace, and alerts members who run outside those boundaries. **The timer keeps ringing when time expires** so the speaking member knows to wrap it up. The timekeeper or moderator may occasionally grant additional time during someone's share, but they never just shut off the timer."],
            [("Parking lot and presentation manager", "th"), "Assigns presenters and coaches for upcoming meetings, stays informed about presentation best practices, maintains the parking lot spreadsheet. At the end of 5% reflections, asks each member if their reflection had a topic that should be added to their parking lot."],
            [("SAP chair", "th"), "Sets up Strategic Alliance Partners for forum visits and topics designed to most benefit the forum, and gives the SAPs the value of introduction and familiarity."],
            [("Scribe", "th"), "Writes down the headline for each person's 5% reflection. At the end of reflections, reads just the headlines so the group can quickly roundtable what each member could do a deep dive on. May be combined with parking lot keeper."],
            [("Constitution manager", "th"), "Gains agreement on the initial forum constitution, advises on applicable situations, and reviews it annually with the forum at each year's retreat, including reaffirming or reassigning forum roles. May be combined with moderator or moderator elect."],
        ]),
    ]),
    dict(id="comms", num="09", toc="Communication", title="Communication protocol", icon="chat-circle-text", blocks=[
        ("p", "When something requires a response from the group:"),
        ("ol", [
            "Send an email with **\"Forum Matter: Response Required\"** in the subject. The group must respond within 24 hours.",
            "Send a text directing everyone's attention to the email.",
        ]),
        ("box", "spirit", "Permission is unanimous, not majority", ["If you are asking permission from the group for something, you have to get a firm response from **everyone** before taking action."]),
    ]),
    dict(id="removal", num="10", toc="Removal and readmission", title="Removal, readmission, and conflict", icon="door-open", blocks=[
        ("table", "Every vote in this document, and what it takes to win", ["The decision", "Who votes", "Threshold"], [
            ["Admit a new member", "All members", ("Unanimous", "n")],
            ["Change the forum size from 8", "All members", ("Unanimous", "n")],
            ["Reinstate a member dismissed for attendance", "All members, on the member's request", ("Unanimous", "n")],
            ["Readmit a member dismissed for a confidentiality breach", "All members, open vote, member out of the room", ("Unanimous", "n")],
            ["Remove a member for conflict or lack of commitment", "All members except the member under consideration", ("75% majority", "n")],
            ["Keep a member who has not re-qualified", "Qualifying members, less the member, private vote", ("Majority", "n")],
            ["Reschedule a meeting", "All members", ("Unanimous", "n")],
            ["Amend this constitution", "Members in good standing, at a regularly scheduled meeting", ("Three quarters", "n")],
        ]),
        ("h3", "Removal for conflict"),
        ("p", "If clearing rounds have proved insufficient to address consistent issues with a specific member, the forum may hold a vote to remove that member following an open discussion with all forum members present, at a regularly scheduled meeting. A **75% majority** is necessary, not including the member under consideration."),
        ("box", "spirit", "What counts as grounds", ["The grounds for removal should be clear actions, speech, or behaviors that indicate a lack of commitment to the group, or a lack of trust and respect for the other members of the group."]),
    ]),
    dict(id="requal", num="11", toc="Re-qualification", title="Re-qualification", icon="seal-check", blocks=[
        ("kv", None, [
            ("The standard", "Members must meet all EO requirements yearly to remain a member: $1M+ in revenue, or the stipulations for special categories. The sale of a business must meet EO qualifications."),
            ("If you fall below", "A **12-month probationary period** to qualify."),
            ("At 12 months post renewal", "If EO qualifications are still not met: a formal review at the forum meeting with Q and A, then a private discussion among the qualifying members and a private vote on whether the member remains. **Majority of the qualifying members, less the member, decides.**"),
        ]),
    ]),
    dict(id="funds", num="12", toc="Forum funds", title="Forum funds", icon="piggy-bank", blocks=[
        ("p", "Member fines and funds from the chapter for SAP visits are used to support the costs of annual retreats or other group activities."),
        ("h3", "If the forum disbands"),
        ("ol", [
            "First, reimburse documented out-of-pocket expenses.",
            "Then, distribute equitably among the members active at the time the funds were earned.",
        ]),
        ("box", "spirit", "What counts as disbanded", ["If the forum loses **more than 33% of its members** in a year, it can be considered disbanded."]),
    ]),
    dict(id="eo", num="13", toc="EO Global required language", title="EO Global required language", icon="globe-hemisphere-west", blocks=[
        ("p", "Our forum agrees to abide by all Global EO official \"must in\" constitution language: discrimination, harassment, qualification, member-in-good-standing definitions, and the rest."),
        ("box", "hard", "Non-discrimination", ["In keeping with EO's values and bylaws, our forum does not discriminate or prevent membership in our forum on the basis of gender, age, religion, sexual orientation, or any other traits identified in the EO Global bylaws."]),
        ("p", "This section is not optional and is not a forum-by-forum choice. Any forum constitution missing it is out of compliance with EO Global."),
    ]),
    dict(id="honor", num="14", toc="How we honor this", title="How we actually honor this", icon="heart", blocks=[
        ("p", "For the sake of clarity, here is how our forum honors this constitution and each other."),
        ("ul", [
            "If the constitution calls for a fine, the member willingly pays the fine, even if it is a first offense. There are no excuses: not \"traffic was bad\", not \"my child had to stay home from school\".",
            "A member is dismissed from the group if there is an absence outlined here, **even for extenuating circumstances**. The point is for the forum to have an opportunity to discuss the matter intentionally and force the conversation, should the member ask to be voted back in.",
        ]),
        ("h3", "Real world examples from healthy forums"),
        ("table", None, ["What happened", "What the forum did"], [
            ["A member receives a medical diagnosis and misses two meetings.", "The dismissed member requested a vote. The forum had the opportunity to discuss whether that member was committed to the group, decided they were, and voted them back in, while communicating that they would still hold a vote for any future absences that year."],
            ["A member has a death in the family and has to skip the retreat.", "The member requested a vote and the forum voted them back in, since they had clearly been committed to the forum thus far."],
        ]),
        ("box", "spirit", "The point", ["We honor this constitution because we acknowledge that policies still allow for us to be human, while also maintaining fairness for all members of our group."]),
    ]),
    dict(id="amend", num="15", toc="Amendments and review", title="Amendments and review", icon="scales", blocks=[
        ("kv", None, [
            ("Amending", "This constitution may be amended during a regularly scheduled meeting by a **three quarters vote** of the forum members in good standing."),
            ("Annual review", "Reviewed annually at the retreat, alongside role decisions and 12 month schedule setting."),
            ("Duration", "This constitution stays in effect until a new one is agreed upon."),
        ]),
    ]),
    dict(id="sign", num="16", toc="Signatures", title="Signatures", icon="signature", blocks=[
        ("sig", 8),
    ]),
    dict(id="appendix-a", num="A", toc="Roles this year", title="Roles and roster for the year", icon="user-list", blocks=[
        ("p", "Roles for dates: July 1, 20{{blank-short}} to June 30, 20{{blank-short}}"),
        ("roles", ["Moderator", "Moderator elect and calendar keeper", "Timekeeper", "Retreat planner", "SAP chair", "Treasurer",
                   "Parking lot and presentation manager", "Scribe", "Constitution manager"]),
        ("roster", 8),
    ]),
    dict(id="appendix-b", num="B", toc="Fill-in checklist", title="Fill-in checklist", icon="list-checks", blocks=[
        ("p", "Every blank in this template, in one place, so a new forum can complete it in one sitting instead of hunting through the document."),
        ("table", None, ["#", "What to fill in", "Where"], [
            [("01", "n"), "Forum number", "[02 The forum](#forum)"],
            [("02", "n"), "Last updated date", "Header stamp"],
            [("03", "n"), "Member roster, name and business, eight rows", "[Appendix A](#appendix-a)"],
            [("04", "n"), "Nine role holders", "[Appendix A](#appendix-a)"],
            [("05", "n"), "Role term dates", "[Appendix A](#appendix-a)"],
            [("06", "n"), "Confirm or replace the standard 1 to 6 PM meeting time", "[03 The meeting](#meeting)"],
            [("07", "n"), "Confirm or replace the retreat budget ranges", "[05 Retreats](#retreats)"],
            [("08", "n"), "Decide: prohibit member business over $1,000, or disclose and file resolutions", "[07 Business](#business)"],
            [("09", "n"), "Signatures, one per member", "[16 Signatures](#sign)"],
        ]),
    ]),
]
