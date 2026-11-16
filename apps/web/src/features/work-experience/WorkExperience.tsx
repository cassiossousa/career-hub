import { useTranslation } from '../../i18n/provider';
import { content } from 'virtual:portfolio-content';
import {
  mapContentToWorkRoles,
  sortRolesByStart,
} from '../../services/work-experience/workModel';
import { WorkExperienceList } from './WorkExperienceList';

export default function WorkExperience() {
  const { locale, messages } = useTranslation();
  const roles = sortRolesByStart(
    mapContentToWorkRoles(content[locale].workExperience, messages),
  );

  return <WorkExperienceList roles={roles} t={messages} />;
}
