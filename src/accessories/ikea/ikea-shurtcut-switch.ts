import { BatteryServiceBuilder } from '../../builders/battery-service-builder';
import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';
import { DeviceState } from '../../zigbee/types';
import { ProgrammableSwitchServiceBuilder } from '../../builders/programmable-switch-service-builder';

export class IkeaShurtcutSwitch extends ZigBeeAccessory {
  protected switchServiceOn: Service;
  protected batteryService: Service;

  getAvailableServices(): Service[] {
    const builder = new ProgrammableSwitchServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    );

    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    [this.switchServiceOn] = builder
      .withStatelessSwitch('ON', 'on', 1, [
        ProgrammableSwitchEvent.SINGLE_PRESS,
        ProgrammableSwitchEvent.LONG_PRESS,
      ])
      .build();

    this.batteryService = new BatteryServiceBuilder(
      this.platform,
      this.accessory,
      this.client,
      this.state
    )
      .withBatteryPercentage()
      .build();

    return [this.switchServiceOn, this.batteryService];
  }

  update(state: DeviceState): void {
    super.update(state);
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    switch (state.action) {
      case 'brightness_move_up':
      case 'brightness_move_down':
        this.switchServiceOn
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.LONG_PRESS);
        break;
      case 'on':
        this.switchServiceOn
          .getCharacteristic(ProgrammableSwitchEvent)
          .setValue(ProgrammableSwitchEvent.SINGLE_PRESS);
        break;
    }
  }
}
