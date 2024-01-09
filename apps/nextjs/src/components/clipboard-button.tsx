"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface Props {
  text: string;
}

/**
 * A button that copies the specified text to the clipboard when clicked
 */
export default function ClipboardButton({ text }: Props) {
  const [copyTransitioning, setCopyTransitioning] = useState(false);

  return (
    <CopyToClipboard text={text}>
      {copyTransitioning ? (
        <CheckIcon className="h-8 cursor-pointer" />
      ) : (
        <CopyIcon
          className="h-8 cursor-pointer"
          onClick={() => {
            setCopyTransitioning(true);
            setTimeout(() => {
              setCopyTransitioning(false);
            }, 2000);
          }}
        />
      )}
    </CopyToClipboard>
  );
}
