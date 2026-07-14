import { PinPad } from "../../components/PinPad";

interface PinPadWrapperProps {
  isDesktopSize: boolean;
  isDisabled: boolean;
  onKeyClick: (k: string) => void;
  showModal: boolean;
  isPortrait: boolean;
  onModalConfirm: () => void;
  SentModalComponent: (props: { isPortrait: boolean; onConfirm: () => void }) => React.JSX.Element;
}

export const PinPadWrapper = ({
  isDesktopSize,
  isDisabled,
  onKeyClick,
  showModal,
  isPortrait,
  onModalConfirm,
  SentModalComponent
}: PinPadWrapperProps) => {
  return (
    <div className="w-full relative flex justify-center mt-3">
      <PinPad 
        isDesktopSize={isDesktopSize} 
        isDisabled={isDisabled} 
        onKeyClick={onKeyClick} 
      />
      {showModal && (
        <SentModalComponent 
          isPortrait={isPortrait} 
          onConfirm={onModalConfirm} 
        />
      )}
    </div>
  );
};
