
import { Filesystem, Directory } from '@capacitor/filesystem';
import { VideoEditor } from '@whiteguru/capacitor-plugin-video-editor';
import { Media } from '@capacitor-community/media';

const $ = (id) => document.getElementById(id);

function notify(message) {
  if (typeof window.toast === 'function') {
    window.toast(message);
  } else {
    alert(message);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      if (comma < 0) {
        reject(new Error('Hindi mabasa ang video file.'));
        return;
      }
      resolve(result.slice(comma + 1));
    };

    reader.onerror = () => reject(new Error('Hindi mabasa ang video file.'));
    reader.readAsDataURL(file);
  });
}

async function getExportAlbum() {
  const albumName = 'Creator Studio Exports';

  let response = await Media.getAlbums();
  let album = (response.albums || []).find(
    (item) => item.name === albumName
  );

  if (!album) {
    await Media.createAlbum({ name: albumName });
    response = await Media.getAlbums();

    album = (response.albums || []).find(
      (item) => item.name === albumName
    );
  }

  if (!album) {
    throw new Error('Hindi mahanap ang export album sa gallery.');
  }

  return album.identifier;
}

async function exportCurrentVideo() {
  const input = $('videoInput');
  const file = input?.files?.[0];

  if (!file) {
    notify('Mag-import muna ng video.');
    return;
  }

  const startSeconds = Number($('trimStart')?.value || 0);
  const video = $('videoPreview');
  const endSeconds = Number(
    $('trimEnd')?.value || video?.duration || 0
  );

  if (
    !Number.isFinite(startSeconds) ||
    !Number.isFinite(endSeconds) ||
    startSeconds < 0 ||
    endSeconds <= startSeconds
  ) {
    notify('Hindi valid ang trim start at end.');
    return;
  }

  if (file.size > 100 * 1024 * 1024) {
    notify('Ang unang test version ay para muna sa videos na 100 MB pababa.');
    return;
  }

  const button = $('exportVideoBtn');
  if (button) button.disabled = true;

  let sourcePath = '';

  try {
    notify('Inihahanda ang video...');

    const extension = file.name.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '.mp4';
    const inputName = `creator-input-${Date.now()}${extension}`;

    const base64 = await fileToBase64(file);

    const saved = await Filesystem.writeFile({
      path: inputName,
      data: base64,
      directory: Directory.Cache
    });

    sourcePath = saved.uri;

    if (!sourcePath) {
      const location = await Filesystem.getUri({
        path: inputName,
        directory: Directory.Cache
      });
      sourcePath = location.uri;
    }

    if (!sourcePath) {
      throw new Error('Hindi makuha ang lokal na file path.');
    }

    notify('Nag-e-export ng video. Hintayin itong matapos...');

    const width = video?.videoWidth || 720;
    const height = video?.videoHeight || 1280;
    const scale = Math.min(1, 1280 / Math.max(width, height));
    const outputWidth = Math.max(2, Math.floor(width * scale / 2) * 2);
    const outputHeight = Math.max(2, Math.floor(height * scale / 2) * 2);

    const result = await VideoEditor.edit({
      path: sourcePath,
      trim: {
        startsAt: Math.round(startSeconds * 1000),
        endsAt: Math.round(endSeconds * 1000)
      },
      transcode: {
        width: outputWidth,
        height: outputHeight,
        keepAspectRatio: true,
        fps: 30
      }
    });

    if (!result?.file?.path) {
      throw new Error('Walang output file na ibinalik ng video editor.');
    }

    const albumIdentifier = await getExportAlbum();

    await Media.saveVideo({
      path: result.file.path,
      albumIdentifier,
      fileName: `CreatorStudio-${Date.now()}`
    });

    notify('Matagumpay na na-export ang video sa gallery!');
  } catch (error) {
    console.error('Video export failed:', error);
    notify(`Hindi natapos ang video export: ${error?.message || error}`);
  } finally {
    if (button) button.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const button = $('exportVideoBtn');
  if (button) {
    button.onclick = exportCurrentVideo;
  }
});
