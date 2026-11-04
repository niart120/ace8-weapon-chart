import weaponsData from './weapons.json';
import targetsData from './targets.json';
import modifiersData from './modifiers.json';
import { validateMasters } from '../domain/validate';
const data: unknown = { weapons: weaponsData, targets: targetsData, modifiers: modifiersData };
validateMasters(data);
export const { weapons, targets, modifiers } = data;
export const publishedParts = modifiers.parts.filter((part) => part.published);
