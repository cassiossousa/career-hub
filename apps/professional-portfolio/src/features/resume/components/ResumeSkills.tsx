import { Box } from '@mui/material';
import BulletList from '@/components/BulletList';
import { collectSkillGroups } from '@/services/skills';
import type { WorkRole } from '@/services/work-experience/workModel';
import type { Translation } from '@/types/i18n';
import ResumeSection from './ResumeSection';

export default function ResumeSkills({
  skills,
  roles,
}: {
  skills: Translation['skills'];
  roles: WorkRole[];
}) {
  const skillEntries = collectSkillGroups(roles);

  return (
    <ResumeSection title={skills.title}>
      <BulletList paddingInlineStart={2}>
        {skillEntries.map((group) => (
          <Box component="li" key={group.category}>
            <Box component="strong">{skills[group.category]}:</Box>{' '}
            {group.items.join(', ')}
          </Box>
        ))}
      </BulletList>
    </ResumeSection>
  );
}
