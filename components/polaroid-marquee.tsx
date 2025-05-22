 'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import type { YearbookEntry } from '@/types';
import cutFrame from '@/public/frames/cut_frame.png';

interface Props {
  entries: YearbookEntry[];
}

const rotations = ['rotate-[-3deg]', 'rotate-2', 'rotate-[2deg]', '-rotate-2'];

export function PolaroidMarquee({ entries }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.polaroid', {
        x: '-100%',
        duration: 40,
        ease: 'linear',
        repeat: -1,
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-visible relative w-full h-[320px] ">
      <div className="flex gap-20 absolute whitespace-nowrap" ref={trackRef}>
        {[...entries, ...entries].map((entry, i) => (
          <div
            key={`${entry.id}-${i}`}
            className={`polaroid relative w-80  flex-shrink-0 ${rotations[i % rotations.length]}`}
          >
            {/* Photo with frame overlay */}
            <div className="relative w-full h-full">
              <Image
                src={entry.image || '/placeholder.jpg'}
                alt={entry.name}
                width={380}
                height={380}
                className="object-cover aspect-square"
              />
              <Image
                src={cutFrame}
                alt="polaroid frame"
                style={{objectFit: "cover"}}
                className="absolute top-0 left-0 z-10 pointer-events-none overflow-visible aspect-square "
              />
            </div>

            {/* Caption */}
            <p className="text-center text-sm mt-2 text-amber-800 font-semibold">
              {entry.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
