import getConfig from "next/config";

/**
 * To ensure assets are correctly loaded when publishing to GitHub Pages,
 * check the environment variables and add the repository name to the URL.
 */
export function buildUrl(path: string): string {
  const {
    publicRuntimeConfig,
  }: {
    publicRuntimeConfig: { root: string };
  } = getConfig();

  return publicRuntimeConfig.root + path;
}
