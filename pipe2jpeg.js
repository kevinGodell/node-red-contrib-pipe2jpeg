'use strict';

const Pipe2Jpeg = require('pipe2jpeg');

module.exports = function (RED) {
  function Pipe2JpegNode(config) {
    RED.nodes.createNode(this, config);

    const pipe2jpeg = new Pipe2Jpeg();

    let jpegCounter = 0;

    const onJpeg = jpeg => {
      this.status({ fill: 'green', shape: 'dot', text: `jpeg ${++jpegCounter}` });

      this.send({ payload: jpeg });
    };

    const onError = err => {
      this.status({ fill: 'red', shape: 'dot', text: err.toString() });

      this.error(err);
    };

    const onInput = msg => {
      const { payload } = msg;

      if (Buffer.isBuffer(payload) === true) {
        return pipe2jpeg.write(payload);
      }

      const err = 'input must be a buffer';

      this.status({ fill: 'red', shape: 'dot', text: err });

      this.error(err);
    };

    const onClose = (removed, done) => {
      pipe2jpeg.resetCache();

      if (removed) {
        pipe2jpeg.off('jpeg', onJpeg);

        pipe2jpeg.off('error', onError);

        this.off('input', onInput);

        this.off('close', onClose);

        this.status({ fill: 'red', shape: 'ring', text: 'removed' });
      } else {
        this.status({ fill: 'red', shape: 'dot', text: 'closed' });
      }

      done();
    };

    pipe2jpeg.on('jpeg', onJpeg);

    pipe2jpeg.on('error', onError);

    this.on('input', onInput);

    this.on('close', onClose);

    this.status({ fill: 'green', shape: 'ring', text: 'ready' });
  }

  RED.nodes.registerType('pipe2jpeg', Pipe2JpegNode);
};
