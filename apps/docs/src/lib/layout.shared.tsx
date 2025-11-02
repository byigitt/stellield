import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <Image
            src="/logo-main.png"
            alt="Stellield Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold">Stellield</span>
        </div>
      ),
    },
  };
}
