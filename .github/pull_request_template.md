## Summary

<!-- What changed and why. Link the issue/task if applicable. -->

## Test plan

<!-- How this was verified. Check what applies: -->

- [ ] `npx lint-staged` clean on staged files
- [ ] Targeted checks pass (`check:types`, related Jest specs)
- [ ] `npm run verify:all` run locally (required for broad/build-system changes)
- [ ] Visual baselines regenerated in the same PR if render-affecting files changed
- [ ] `packages/ui` changes verified via `npm run test --workspace @career-hub/ui`

## Notes for reviewers

<!-- Risk areas, deferred work, or follow-ups. -->
