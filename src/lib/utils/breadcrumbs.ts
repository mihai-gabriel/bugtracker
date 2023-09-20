import type { Breadcrumb } from '$lib/interfaces/shared';

const checkDynamicPath = (path: string): boolean => {
  return path.at(0) === '[' && path.at(-1) === ']';
};

const getKeyFromDynamicPath = (dynamicPath: string): string => {
  return dynamicPath.replace('[', '').replace(']', '');
};

const getCurrentName = (location: string, params: Record<string, string>): string => {
  if (checkDynamicPath(location)) {
    return params[getKeyFromDynamicPath(location)];
  }

  const firstCapitalLetter = location.charAt(0).toUpperCase();
  const remainingLetters = location.slice(1);

  return firstCapitalLetter + remainingLetters;
};

const getCurrentPath = (location: string, params: Record<string, string>): string => {
  if (checkDynamicPath(location)) {
    return `/${params[getKeyFromDynamicPath(location)]}`;
  }

  return `/${location}`;
};

export const generateBreadcrumbs = (
  route: string,
  params: Record<string, string>
): Array<Breadcrumb> => {
  let path = '';

  const breadcrumbs = route
    .slice(1)
    .split('/')
    .map(location => {
      const name = getCurrentName(location, params);
      const currentPath = getCurrentPath(location, params);

      path += currentPath;

      return { name, path };
    });

  return [{ name: 'Home', path: '/' }].concat(breadcrumbs);
};
