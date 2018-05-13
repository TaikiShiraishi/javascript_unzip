/* eslint no-param-reassign: ["error", { "props": false }] */
import JSZip from 'jszip';

function init() {
  window.removeEventListener('DOMContentLoaded', init, false);

  class ImageUploadPreviewer {
    constructor(moduleRoot, threshold = 100) {
      this._input = moduleRoot.querySelector('.js-imageInput');
      this._threshold = threshold;
      this._resetState();
      this._output = document.getElementById('output');
      this._dropArea = document.getElementById('js-dropArea');
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


      if (!file) {
        this._fileCanceled();
        return;
      }

      if (!this._validateFileType()) {
        return;
      }

      this._zipToImage(file);

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

    _onDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
      this._dropArea.style.cssText += 'background-color: tomato';
    }

    _onDrop(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      const file = evt.dataTransfer.files[0];
      this._zipToImage(file);
    }

    _zipToImage(file) {
      const zip = new JSZip();

      zip.loadAsync(file)
        .then((zipfile) => {
          const fileNames = Object.keys(zipfile.files);
          const filterFileNames = fileNames.filter(fileName => fileName.match(/^(?!__MACOSX).*$/));
          const imagesNames = filterFileNames.filter(filterFileName => filterFileName.match(/^.*.png$|^.*.jpg$/));
          const newfiles = imagesNames.map(x => zipfile.files[x]);
          newfiles.forEach((newfile) => {
            newfile.async('blob').then((blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                const base64data = reader.result;
                const img = document.createElement('img');
                img.src = base64data;
                this._output.appendChild(img);
              };
            });
          });
        }, (error) => {
          console.log(`Error reading ${file.name}: ${error.message}`);
        });
    }

    _attachHandlers() {
      this._input.addEventListener('change', this._onChangeInput, false);
      this._dropArea.addEventListener('dragover', this._onDragOver, false);
      this._dropArea.addEventListener('drop', this._onDrop, false);
    }

    _setBoundHandlers() {
      this._onChangeInput = this._onChangeInput.bind(this);
      this._previewImageOnLoadStart = this._previewImageOnLoadStart.bind(this);
      this._previewImageOnError = this._previewImageOnError.bind(this);
      this._onDragOver = this._onDragOver.bind(this);
      this._onDrop = this._onDrop.bind(this);
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

