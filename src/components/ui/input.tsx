import * as React from "react";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={['w-full px-3 py-2 border rounded-md', props.className || ''].join(' ')} />;
}
