import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

interface NotificationOptions {
  title: string;
  body: string;
}

export async function showNotification (options: NotificationOptions): Promise<void> {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  if (permissionGranted) {
    sendNotification({
      title: options.title,
        body: options.body
    });
  }
}

