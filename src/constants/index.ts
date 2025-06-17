import { availableLanguages } from "./language";
import { translations } from "./translation";

const updateInterval = [
{
    value: 60000,
    label: "1 Minute",
},
{
  value: 1800000,
  label: "30 Minutes",
}, {
  value: 3600000,
  label: "1 Hour",
}, {
  value: 21600000,
  label: "6 Hours",
}, {
  value: 43200000,
  label: "12 Hours",
}, {
  value: 86400000,
  label: "Daily",
}, {
  value: 604800000,
  label: "Weekly",
}];

export const appThemeOptions = [
  { value: "system",  label: "System"},
  {value: "light", label: "Light"},
  {value: "dark", label: "Dark"},
];

 const resolutionOptions = [
    "1366x768",
    "1440x900",
    "1600x900",
    "1920x1080",
    "2560x1440",
    "3840x2160",
  ];

export { availableLanguages, translations, updateInterval, resolutionOptions };
