import { Component, OnInit } from '@angular/core';

import * as tf from '@tensorflow/tfjs';
import yolo, { downloadModel } from 'tfjs-yolo-tiny';

import { Webcam } from './webcam';

let model;
const webcam = new Webcam(document.getElementById('webcam'));



@Component({
  selector: 'app-yolo',
  templateUrl: './yolo.component.html',
  styleUrls: ['./yolo.component.scss']
})
export class YoloComponent implements OnInit {

  webcamElem: HTMLElement;
  constructor() { }

  async ngOnInit() {
  }

  async main() {
    try {
      model = await downloadModel();

      alert('Just a heads up! We\'ll ask to access your webcam so that we can ' +
        'detect objects in semi-real-time. \n\nDon\'t worry, we aren\'t sending ' +
        'any of your images to a remote server, all the ML is being done ' +
        'locally on device, and you can check out our source code on Github.');

      await webcam.setup();
      this.doneLoading();
      this.run();
    } catch (e) {
      console.error(e);
      this.showError();
    }
  }

  async run() {
    while (true) {
      this.clearRects();

      const inputImage = webcam.capture();

      const t0 = performance.now();

      const boxes = await yolo(inputImage, model);

      const t1 = performance.now();
      console.log('YOLO inference took ' + (t1 - t0) + ' milliseconds.');

      boxes.forEach(box => {
        const {
          top, left, bottom, right, classProb, className,
        } = box;

        this.drawRect(left, top, right - left, bottom - top,
          `${className} Confidence: ${Math.round(classProb * 100)}%`);
      });

      await tf.nextFrame();
    }
  }


  drawRect(x, y, w, h, text = '', color = 'red') {
    const rect = document.createElement('div');
    rect.classList.add('rect');
    rect.style.cssText = `top: ${y}; left: ${x}; width: ${w}; height: ${h}; border-color: ${color}`;

    const label = document.createElement('div');
    label.classList.add('label');
    label.innerText = text;
    rect.appendChild(label);
    this.webcamElem = document.getElementById('webcam-wrapper');

    this.webcamElem.appendChild(rect);
  }

  clearRects() {
    const rects = document.getElementsByClassName('rect');
    while (rects[0]) {
      rects[0].parentNode.removeChild(rects[0]);
    }
  }

  doneLoading() {
    const elem = document.getElementById('loading-message');
    elem.style.display = 'none';

    const successElem = document.getElementById('success-message');
    successElem.style.display = 'block';

    const webcamElem = document.getElementById('webcam-wrapper');
    webcamElem.style.display = 'flex';
  }

  showError() {
    const elem = document.getElementById('error-message');
    elem.style.display = 'block';
    this.doneLoading();
  }

}
