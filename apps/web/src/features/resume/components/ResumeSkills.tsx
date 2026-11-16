import { Box } from '@mui/material';
import { skills as skillGroups } from '../../../services/skills';
import type { ResumeSkillLabels } from '../types';
import ResumeSection from './ResumeSection';

export default function ResumeSkills({
  skills,
}: {
  skills: ResumeSkillLabels;
}) {
  const skillEntries = Object.entries(skillGroups) as [
    keyof typeof skillGroups,
    string[],
  ][];

  return (
    <ResumeSection title={skills.title}>
      <Box component="ul">
        {skillEntries.map(([key, items]) => (
          <Box component="li" key={key}>
            <Box component="strong">{skills[key]}:</Box> {items.join(', ')}
          </Box>
        ))}
      </Box>
    </ResumeSection>
  );
}
