'use strict';

const P2J = require('pipe2jpeg');

module.exports = function (RED) {
  function Pipe2Jpeg(config) {
    RED.nodes.createNode(this, config);

    const p2j = new P2J();

    const onJpeg = jpeg => {
      this.status({ fill: 'green', shape: 'dot', text: 'jpeg ok' });

      this.send({ payload: jpeg });
    };

    const onError = err => {
      this.status({ fill: 'red', shape: 'dot', text: err });

      this.error(`pipe2jpeg: ${err}`);
    };

    const onInput = msg => {
      const { payload } = msg;

      if (Buffer.isBuffer(payload) === true) {
        return p2j.write(payload);
      }

      this.status({ fill: 'red', shape: 'dot', text: 'input error' });

      this.error('pipe2jpeg: input must be a buffer');
    };

    const onClose = (removed, done) => {
      p2j.resetCache();

      if (removed) {
        p2j.off('jpeg', onJpeg);

        p2j.off('error', onError);

        this.off('input', onInput);

        this.off('close', onClose);

        this.status({ fill: 'red', shape: 'ring', text: 'removed' });
      } else {
        this.status({ fill: 'red', shape: 'dot', text: 'closed' });
      }

      done && done();
    };

    p2j.on('jpeg', onJpeg);

    p2j.on('error', onError);

    this.on('input', onInput);

    this.on('close', onClose);

    this.status({ fill: 'green', shape: 'ring', text: 'ready' });
  }

  RED.nodes.registerType('pipe2jpeg', Pipe2Jpeg);
};
