import { compareVersions } from '../versionComparator';

describe('compareVersions', () => {
  it('sorts semantic versions by numeric segments', () => {
    expect(compareVersions('1.2.0', '1.1.9')).toBe(1);
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
  });

  it('treats prerelease versions as lower than stable versions', () => {
    expect(compareVersions('2.0.0-beta.1', '2.0.0')).toBe(-1);
    expect(compareVersions('2.0.0-beta.2', '2.0.0-beta.1')).toBe(1);
  });
});
