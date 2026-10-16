# Connected Axiom experiences

Church invitations assign both an audience and an editing role. Existing owners and staff default to AxiomLead; existing viewers migrate to AxiomU. Owners can change other members' groups in Team workspace.

- AxiomLead: service planning, private study notes, drag or arrow reordering, team communication and publication. Send to Tech creates an explicit snapshot of the running order, its referenced slide content and production notes.
- Axiom Pro: receives those snapshots and service files, acknowledges handoffs, exchanges comments, and imports plans into the existing offline presentation engine. New handoffs also appear inside the studio.
- AxiomU: published summaries, highlights, scriptures, church notes and HTTPS social links. Personal notes stay in the current browser. Guest service links remain available without accounts.

Server endpoints enforce audience membership. Tech never receives private study notes; members receive no staff workspace, files or comments. Web studio access requires Tech membership while online. Prepared Tech browsers retain offline presentation access. The standalone desktop presentation engine remains usable locally without a cloud account; desktop installers must be rebuilt separately to ship these source updates.

Apply db/004_audience_experiences.sql through npm run migrate before deployment. No paid service or new provider is introduced.

New accounts choose AxiomLead, Axiom Pro, or AxiomU before creating their own workspace. Invitations still assign the church group. Church owners can use Change experience in the header; other members cannot change their own group. The public production domain is https://axiomworship.vercel.app and is attached to the Vercel project for future deployments. axiom.vercel.app was already taken.

AxiomLead includes four editable starter templates (Sunday worship, prayer evening, Bible study, communion). Its service desk uses tabs for the running order, preparation notes, private study notes, congregation publication, and team files/conversation.
