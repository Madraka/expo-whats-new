import { router } from 'expo-router';

import { markWhatsNewSheetDismissed, markWhatsNewSheetPresented, openWhatsNewSheet } from '../whats-new-route';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const pushMock = router.push as jest.Mock;

describe('whats-new route guard', () => {
  beforeEach(() => {
    pushMock.mockReset();
    markWhatsNewSheetDismissed();
  });

  it('opens the sheet once and blocks duplicate pushes while presented', () => {
    expect(openWhatsNewSheet()).toBe(true);
    expect(openWhatsNewSheet()).toBe(false);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/whats-new');
  });

  it('allows opening again after the sheet is dismissed', () => {
    expect(openWhatsNewSheet()).toBe(true);

    markWhatsNewSheetDismissed();

    expect(openWhatsNewSheet()).toBe(true);
    expect(pushMock).toHaveBeenCalledTimes(2);
  });

  it('blocks opening when the route marks itself as presented', () => {
    markWhatsNewSheetPresented();

    expect(openWhatsNewSheet()).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('resets the guard if navigation throws', () => {
    const navigationError = new Error('navigation failed');

    pushMock.mockImplementationOnce(() => {
      throw navigationError;
    });

    expect(() => openWhatsNewSheet()).toThrow(navigationError);
    expect(openWhatsNewSheet()).toBe(true);
    expect(pushMock).toHaveBeenCalledTimes(2);
  });
});
