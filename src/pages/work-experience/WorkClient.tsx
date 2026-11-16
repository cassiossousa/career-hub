import { useEffect, useRef, useState } from 'react';
import type { Translation } from '../../types/i18n';
import type { WorkRole } from '../../services/work-experience/workModel';

export function WorkClient({
  roles,
  t,
}: {
  roles: WorkRole[];
  t: Translation;
}) {
  return (
    <section className="container-main">
      <h1 className="text-3xl font-bold mb-10">{t.workExperience.title}</h1>
      <div className="flex flex-col gap-4">
        {roles.map((role, index) => (
          <AccordionItem key={`${role.company}-${index}`} role={role} />
        ))}
      </div>
    </section>
  );
}

function AccordionItem({ role }: { role: WorkRole }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHeight(open ? (contentRef.current?.scrollHeight ?? 0) : 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <article className="border-b pb-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full justify-between items-start text-left"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{role.company}</h2>
          <h3 className="text-lg font-semibold text-primary">{role.title}</h3>
          <p className="text-sm opacity-90">
            {role.location && `${role.location} | `}
            {role.period}
          </p>
        </div>
        <span className="text-2xl" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          maxHeight: `${height}px`,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <ul className="mt-4 list-disc pl-5 space-y-2">
          {role.bullets.map((bullet, index) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
