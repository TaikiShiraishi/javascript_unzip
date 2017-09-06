import JSZip from 'jszip';

function init() {
  window.removeEventListener('DOMContentLoaded', init, false);

  class ImageUploadPreviewer {
    constructor(moduleRoot, threshold = 100) {
      this._input = moduleRoot.querySelector('.js-imageInput');
      this._threshold = threshold;
      this._resetState();
    }

    _resetState() {
      this._loadStartTime = 0;
      this._reader = null;
      this._file = null;
    }

    _fileCanceled() {
      this._resetState();
    }

    _validateFileType() {
      const type = this._file.type;
      if (type === 'application/zip') {
        return true;
      }
      this._input.value = '';
      this._resetState();
      return false;
    }

    _previewImageOnLoadStart() {
      this._loadStartTime = Date.now();
      this._input.disabled = true;
    }

    _previewImageOnError() {
      this._input.value = '';
      this._resetState();
    }

    _onChangeInput(evt) {
      const file = evt.target.files[0];
      this._file = file;

      const zip = new JSZip();

      zip.loadAsync(file)
        .then((zipfile) => {
          const jpegFiles = zipfile.filter((zipEntry) => {
            const imageFiles = zipEntry.match(/jpg|png/);
            return imageFiles ? imageFiles.input.indexOf('__MACOSX') >= 0 : false;
          });
          console.log(jpegFiles);
          // zipfile.forEach((relativePath, zipEntry) => {
          //   console.log(zipEntry.name);
          // });
        }, (error) => {
          console.log(`Error reading ${file.name}: ${error.message}`);
        });

      if (!file) {
        this._fileCanceled();
        return;
      }

      if (!this._validateFileType()) {
        return;
      }

      this._reader = new FileReader();
      const reader = this._reader;
      reader.onloadstart = this._previewImageOnLoadStart;
      reader.onload = () => {
        this._resetState();
        this._input.disabled = false;
        return null;
      };
      reader.onerror = this._previewImageOnError;
      reader.readAsDataURL(file);
    }

    _attachHandlers() {
      this._input.addEventListener('change', this._onChangeInput, false);
    }

    _setBoundHandlers() {
      this._onChangeInput = this._onChangeInput.bind(this);
      this._previewImageOnLoadStart = this._previewImageOnLoadStart.bind(this);
      this._previewImageOnError = this._previewImageOnError.bind(this);
    }

    init() {
      this._setBoundHandlers();
      this._attachHandlers();
    }
  }

  function registerImagePreviewer() {
    const previews = document.querySelectorAll('.js-imageUpload');
    if (!previews.length) {
      return;
    }

    const len = previews.length;
    let i = 0;

    do {
      const preview = previews[i];
      const imageUploadPreviewer = new ImageUploadPreviewer(preview, 400);
      imageUploadPreviewer.init();
      i += 1;
    } while (i < len);
  }
  registerImagePreviewer();
}

window.addEventListener('DOMContentLoaded', init, false);

