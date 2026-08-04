/**
 * Patches Capacitor iOS/Android projects for background audio
 * (@mediagrid/capacitor-native-audio requirements).
 *
 * Run after `npx cap add ios|android` or `npx cap sync`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, contents) {
  fs.writeFileSync(file, contents);
  console.log(`updated ${path.relative(root, file)}`);
}

function patchIosInfoPlist() {
  const plistPath = path.join(root, 'ios/App/App/Info.plist');
  if (!fs.existsSync(plistPath)) {
    console.log('skip iOS Info.plist (ios platform not present)');
    return;
  }
  let xml = read(plistPath);
  if (xml.includes('UIBackgroundModes') && xml.includes('<string>audio</string>')) {
    console.log('iOS UIBackgroundModes already includes audio');
    return;
  }
  if (xml.includes('UIBackgroundModes')) {
    xml = xml.replace(
      /<key>UIBackgroundModes<\/key>\s*<array>([\s\S]*?)<\/array>/,
      (block) =>
        block.includes('<string>audio</string>')
          ? block
          : block.replace('</array>', '    <string>audio</string>\n    </array>')
    );
  } else {
    xml = xml.replace(
      '</dict>\n</plist>',
      `  <key>UIBackgroundModes</key>
  <array>
    <string>audio</string>
  </array>
</dict>
</plist>`
    );
  }
  write(plistPath, xml);
}

function patchAndroidManifest() {
  const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) {
    console.log('skip AndroidManifest.xml (android platform not present)');
    return;
  }
  let xml = read(manifestPath);
  let changed = false;

  if (!xml.includes('AudioPlayerService')) {
    const serviceSnippet = `
        <service
            android:name="us.mediagrid.capacitorjs.plugins.nativeaudio.AudioPlayerService"
            android:description="@string/audio_player_service_description"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>`;
    if (!xml.includes('</application>')) {
      throw new Error('Could not find </application> in AndroidManifest.xml');
    }
    xml = xml.replace('</application>', `${serviceSnippet}\n    </application>`);
    changed = true;
  }

  const perms = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    'android.permission.WAKE_LOCK',
  ];
  for (const perm of perms) {
    if (xml.includes(`android:name="${perm}"`)) continue;
    if (xml.includes('<!-- Permissions -->')) {
      xml = xml.replace(
        '<!-- Permissions -->',
        `<!-- Permissions -->\n    <uses-permission android:name="${perm}" />`
      );
    } else {
      xml = xml.replace(
        '</manifest>',
        `    <uses-permission android:name="${perm}" />\n</manifest>`
      );
    }
    changed = true;
  }

  if (changed) write(manifestPath, xml);
  else console.log('AndroidManifest.xml already configured');
}

function patchAndroidStrings() {
  const stringsPath = path.join(root, 'android/app/src/main/res/values/strings.xml');
  if (!fs.existsSync(stringsPath)) {
    console.log('skip strings.xml (android platform not present)');
    return;
  }
  let xml = read(stringsPath);
  if (xml.includes('audio_player_service_description')) {
    console.log('Android audio service string already present');
    return;
  }
  xml = xml.replace(
    '</resources>',
    `    <string name="audio_player_service_description">Allows for audio to play in the background.</string>
</resources>`
  );
  write(stringsPath, xml);
}

patchIosInfoPlist();
patchAndroidManifest();
patchAndroidStrings();
console.log('native audio config applied');
