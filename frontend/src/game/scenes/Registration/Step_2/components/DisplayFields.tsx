import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

export const DisplayFields = () => {
  const mode = useRegistrationStep2Store(s => s.mode);
  const phone = useRegistrationStep2Store(s => s.phone);
  const code = useRegistrationStep2Store(s => s.code);

  const displayValue = mode === 'code' ? code.padEnd(4, '_').split('').join(' ') : phone;

  return (
    <p
      style={{
        letterSpacing: mode === 'code' ? '12px' : 'normal',
        paddingLeft: mode === 'code' ? '12px' : '0px',
      }}
      className="m-0 box-border flex shrink-0 items-center justify-center rounded-full border border-slate-50 bg-white p-0 font-black text-slate-700 shadow-md select-none pointer-events-none h-[90px] w-[540px] text-[22px]"
    >
      {displayValue}
    </p>
  );
};
