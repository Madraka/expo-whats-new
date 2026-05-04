type ParsedVersion = {
  main: number[];
  prerelease: string[];
};

function parseVersion(version: string): ParsedVersion {
  const [mainVersion, prereleaseVersion = ''] = version.split('-', 2);

  return {
    main: mainVersion
      .split('.')
      .map((part) => Number.parseInt(part.replace(/\D.*/, ''), 10))
      .map((part) => (Number.isFinite(part) ? part : 0)),
    prerelease: prereleaseVersion ? prereleaseVersion.split('.') : [],
  };
}

export function compareVersions(left: string, right: string): number {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);
  const length = Math.max(leftVersion.main.length, rightVersion.main.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftVersion.main[index] ?? 0;
    const rightPart = rightVersion.main[index] ?? 0;

    if (leftPart > rightPart) {
      return 1;
    }

    if (leftPart < rightPart) {
      return -1;
    }
  }

  if (leftVersion.prerelease.length === 0 && rightVersion.prerelease.length > 0) {
    return 1;
  }

  if (leftVersion.prerelease.length > 0 && rightVersion.prerelease.length === 0) {
    return -1;
  }

  const prereleaseLength = Math.max(leftVersion.prerelease.length, rightVersion.prerelease.length);

  for (let index = 0; index < prereleaseLength; index += 1) {
    const leftPart = leftVersion.prerelease[index];
    const rightPart = rightVersion.prerelease[index];

    if (leftPart === undefined) {
      return -1;
    }

    if (rightPart === undefined) {
      return 1;
    }

    const leftNumber = Number.parseInt(leftPart, 10);
    const rightNumber = Number.parseInt(rightPart, 10);
    const bothNumeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);

    if (bothNumeric && leftNumber !== rightNumber) {
      return leftNumber > rightNumber ? 1 : -1;
    }

    if (!bothNumeric && leftPart !== rightPart) {
      return leftPart > rightPart ? 1 : -1;
    }
  }

  return 0;
}
