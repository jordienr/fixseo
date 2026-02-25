"use client";
import { motion } from "framer-motion";

const asciiLines = [
  "███████╗██╗██╗  ██╗ ██████╗███████╗ █████╗ ",
  "██╔════╝██║╚██╗██╔╝██╔════╝██╔════╝██╔══██╗",
  "█████╗  ██║ ╚███╔╝ ╚█████╗ █████╗  ██║  ██║",
  "██╔══╝  ██║ ██╔██╗  ╚═══██╗██╔══╝  ██║  ██║",
  "██║     ██║██╔╝╚██╗██████╔╝███████╗╚█████╔╝",
  "╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚════╝ ",
];

export function FixseoAscii() {
  const charsPerLine = asciiLines[0].length;

  return (
    <div className="flex flex-col scale-50">
      {asciiLines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex">
          {line.split("").map((char, charIndex) => (
            <motion.span
              key={`${lineIndex}-${charIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: (lineIndex * charsPerLine + charIndex) * 0.003,
                duration: 0,
              }}
              className="text-sm leading-4 font-bold"
            >
              {char}
            </motion.span>
          ))}
        </div>
      ))}
    </div>
  );
}
