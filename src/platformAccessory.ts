import {CharacteristicValue, PlatformAccessory, Service} from 'homebridge';
import {HomebridgeDenonAVR} from './platform';
import Denon from 'denon-client';

export class DenonAccessory {
  private service!: Service;
  private state = { mute: false };

  constructor(
    private readonly platform: HomebridgeDenonAVR,
    private readonly accessory: PlatformAccessory,
  ) {
    const device = new Denon.DenonClient(accessory.context.device.host);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Denon')
      .setCharacteristic(this.platform.Characteristic.Model, 'AVR-X1000')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb)
      || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(async (value: CharacteristicValue) => {
        this.state.mute = value.valueOf() as boolean;
        await device.setPower(this.state.mute ? 'STANDBY' : 'ON');
      })
      .onGet(() => this.state.mute);

    device.on('powerChanged', (data: 'STANDBY' | 'ON') => {
      this.state.mute = data === 'STANDBY';
      this.platform.log.info('Update mute', this.state.mute);
      this.service.updateCharacteristic(this.platform.Characteristic.On, this.state.mute);
    });

    device.connect();
  }
}
