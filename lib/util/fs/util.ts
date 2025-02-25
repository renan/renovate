import upath from 'upath';
import { GlobalConfig } from '../../config/global';
import { FILE_ACCESS_VIOLATION_ERROR } from '../../constants/error-messages';
import { logger } from '../../logger';

// http://www.mtu.edu/umc/services/digital/writing/characters-avoid/
// We allow spaces, but not newlines
const restricted = /[[\]#%&{}<>*?\b\n\r\0!'"|‘“^`]/;

function assertBaseDir(path: string, baseDir: string): void {
  if (!path.startsWith(baseDir)) {
    logger.debug(
      { path, baseDir },
      'Preventing access to file outside the base directory'
    );
    throw new Error(FILE_ACCESS_VIOLATION_ERROR);
  }
}

function ensurePath(path: string, key: 'localDir' | 'cacheDir'): string {
  if (restricted.test(path)) {
    logger.debug({ path }, 'Preventing access to path with illegal characters');
    throw new Error(FILE_ACCESS_VIOLATION_ERROR);
  }

  const baseDir = upath.resolve(GlobalConfig.get(key)!);
  const fullPath = upath.resolve(
    upath.isAbsolute(path) ? path : upath.join(baseDir, path)
  );
  assertBaseDir(fullPath, baseDir);
  return fullPath;
}

export function ensureLocalPath(path: string): string {
  return ensurePath(path, 'localDir');
}

export function ensureCachePath(path: string): string {
  return ensurePath(path, 'cacheDir');
}

export function isValidPath(
  path: string,
  key: 'localDir' | 'cacheDir'
): boolean {
  if (restricted.test(path)) {
    return false;
  }

  const baseDir = upath.resolve(GlobalConfig.get(key)!);
  const fullPath = upath.resolve(
    upath.isAbsolute(path) ? path : upath.join(baseDir, path)
  );

  return fullPath.startsWith(baseDir);
}
