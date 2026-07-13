export class RegistrationLogic_Step4 {
  private onCompleteCallback: () => void;

  constructor(onComplete: () => void) {
    this.onCompleteCallback = onComplete;
  }

  public handleFinalPlayClick = (): void => {
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  };
}
