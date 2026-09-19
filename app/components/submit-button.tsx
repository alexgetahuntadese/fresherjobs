'use client';

import { useFormStatus } from 'react-dom';

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-5 py-2.5 text-sm font-semibold text-[#160d24] shadow-[0_8px_30px_rgba(167,139,250,0.25)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
