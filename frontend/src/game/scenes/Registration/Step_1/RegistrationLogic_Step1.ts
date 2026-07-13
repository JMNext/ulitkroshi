import { setRegistrationStageUI, setRegistrationNameUI } from './RegistrationUI_Step1';

export class RegistrationLogic_Step1 {
  private scene: any;
  private petName: string = '';

  constructor(scene: any) {
    this.scene = scene;
  }

  public getScene(): any {
    return this.scene;
  }

  public handleInputSubmit = (name: string): void => {
    this.petName = name.trim() || 'Булька';
    setRegistrationNameUI(this.petName);
    setRegistrationStageUI(2);
  };

  public handleConfirmYes = (): void => {
    setRegistrationStageUI(4);
  };

  public handleConfirmNo = (): void => {
    setRegistrationStageUI(3);
  };

  public destroy = (): void => {
  };
}
