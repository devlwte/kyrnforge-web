// Default Site Data and Project Catalog
// Stored in standard JSON format for easy editing and API consumption
import { initialAvailableApps } from './defaultApps';
import projectsData from './projects.json';
import settingsData from './settings.json';

export { initialAvailableApps };
export const initialProjects = projectsData;
export const initialSiteSettings = settingsData;

export default {
  availableApps: initialAvailableApps,
  projects: initialProjects,
  siteSettings: initialSiteSettings
};
