import React, { Component } from 'react';
import qrcode from 'qrcode';

export class QRCodeComponent extends Component {
  componentDidMount() {
    let qrText = JSON.stringify({ship: this.props.ship.substr(1), code: this.props.code});
    qrcode.toCanvas(document.getElementById('urb-qr-canvas'), qrText, {
      width: 256,
      margin: 0
    }, error => {
      console.log("qr whoops = ", error);
    })
  }

  render() {
    return (
      <canvas className="mt-4" id="urb-qr-canvas"></canvas>
    )
  }
}
