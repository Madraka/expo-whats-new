import { router } from 'expo-router';

let isWhatsNewSheetPresented = false;

export function openWhatsNewSheet() {
  if (isWhatsNewSheetPresented) {
    return false;
  }

  isWhatsNewSheetPresented = true;

  try {
    router.push('/whats-new');
    return true;
  } catch (error) {
    isWhatsNewSheetPresented = false;
    throw error;
  }
}

export function markWhatsNewSheetPresented() {
  isWhatsNewSheetPresented = true;
}

export function markWhatsNewSheetDismissed() {
  isWhatsNewSheetPresented = false;
}
