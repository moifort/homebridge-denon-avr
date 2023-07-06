import {CharacteristicValue, PlatformAccessory, Service} from 'homebridge';
import {HomebridgeDenonAVR} from './platform';
import axios from 'axios';

export class DenonAccessory {
  private service!: Service;
  private state = { on: false };

  constructor(
    private readonly platform: HomebridgeDenonAVR,
    private readonly accessory: PlatformAccessory,
  ) {
    const http = axios.create({ baseURL: `http://${accessory.context.device.host}` });

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Denon')
      .setCharacteristic(this.platform.Characteristic.Model, 'AVR-X1000')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet( (value: CharacteristicValue) => {
        this.state.on = value.valueOf() as boolean;
        if (this.state.on) {
          http.get('/goform/formiPhoneAppDirect.xml?SISAT/CBL');
        } else {
          http.get('/goform/formiPhoneAppDirect.xml?PWSTANDBY');
        }
      })
      .onGet(() => this.state.on);

    // device.on('powerChanged', (data: 'STANDBY' | 'ON') => {
    //   this.state.on = data === 'ON';
    //   this.platform.log.info('Update mute', this.state.on);
    //   this.service.updateCharacteristic(this.platform.Characteristic.On, this.state.on);
    // });
  }
}
