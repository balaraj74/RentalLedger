# Workflow: Final Quality Gate

- Confirm every required route is implemented or the unfinished route is plainly documented.
- Verify role-aware navigation and actual server authorization where backend integration exists.
- Verify forms, tables, search, filters, pagination, state feedback, and responsive behavior.
- Check WCAG-inspired basics: keyboard reachability, focus visibility, contrast, labels, table headings, status text and reduced motion.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` where configured.
- Run dependency and security checks where practical.
- Inspect `git diff` for secrets, stray debug code, accidental generated files and unrelated changes.
- Update `docs/implementation/IMPLEMENTATION_STATUS.md` with pass/fail/blocked outcomes.
- Final report must distinguish completed, mock-backed, live-integrated, and blocked features. Never overstate validation.
