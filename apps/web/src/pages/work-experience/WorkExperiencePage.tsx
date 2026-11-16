import { useTranslation } from '../../i18n/provider';
import { content } from 'virtual:portfolio-content';
import {
  mapContentToWorkRoles,
  sortRolesByStart,
} from '../../services/work-experience/workModel';
import { WorkClient } from './WorkClient';

export default function WorkExperiencePage() {
  const { locale, messages } = useTranslation();
  const roles = sortRolesByStart(
    mapContentToWorkRoles(content[locale].workExperience, messages),
  );

  return <WorkClient roles={roles} t={messages} />;
}
