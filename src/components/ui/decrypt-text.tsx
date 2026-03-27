"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#@$%&~|;:ABCDEFabcdef0123456789";

interface Props {
  text: string;
  className?: string;
  /** ms antes de arrancar la primera animación */
  delay?: number;
  /** velocidad de revelado: ms por carácter */
  speed?: number;
  /** ms de pausa entre repeticiones del efecto */
  repeatInterval?: number;
}

export default function DecryptText({
  text,
  className,
  delay = 600,
  speed = 35,
  repeatInterval = 4000,
}: Props) {
  const [displayed, setDisplayed] = useState(text);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function runDecrypt() {
      let revealed = 0;

      if (frameRef.current) clearInterval(frameRef.current);

      frameRef.current = setInterval(() => {
        setDisplayed(
          text
            .split("")
            .map((char, i) => {
              if (char === " ") return " ";
              if (i < revealed) return char;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        revealed += 1;

        if (revealed > text.length) {
          clearInterval(frameRef.current!);
          setDisplayed(text);
          // programa la siguiente repetición
          loopRef.current = setTimeout(runDecrypt, repeatInterval);
        }
      }, speed);
    }

    // primera ejecución con delay inicial
    loopRef.current = setTimeout(runDecrypt, delay);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [text, delay, speed, repeatInterval]);

  return (
    <span className={className} aria-label={text}>
      {displayed}
    </span>
  );
}
