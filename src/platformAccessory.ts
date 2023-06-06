import {CharacteristicValue, PlatformAccessory, Service} from 'homebridge';
import {HomebridgeDenonAVR} from './platform';
import Denon from 'denon-client';

export class DenonAccessory {
  private service!: Service;
  private state = { on: false };

  constructor(
    private readonly platform: HomebridgeDenonAVR,
    private readonly accessory: PlatformAccessory,
  ) {
    const device = new Denon.DenonClient(accessory.context.device.host);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Denon')
      .setCharacteristic(this.platform.Characteristic.Model, 'AVR-X1000')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(async (value: CharacteristicValue) => {
        this.state.on = value.valueOf() as boolean;
        try {
          await device.setPower(this.state.on ? 'ON' : 'STANDBY').then(() => device.setInput('SAT/CBL'));
        } catch (e) {
          this.platform.log.warn('Reconnect');
          await device.connect();
          await device.setPower(this.state.on ? 'ON' : 'STANDBY').then(() => device.setInput('SAT/CBL'));
        }

      })
      .onGet(() => this.state.on);

    device.on('powerChanged', (data: 'STANDBY' | 'ON') => {
      this.state.on = data === 'ON';
      this.platform.log.info('Update mute', this.state.on);
      this.service.updateCharacteristic(this.platform.Characteristic.On, this.state.on);
    });

    device.connect();
  }
}
