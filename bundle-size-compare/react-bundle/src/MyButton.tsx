import { useState, useEffect } from "react";

export const MyButton = ({ label = "Click me" }: { label?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`Clicked ${count} times`);
  }, [count]);

  return (
    <button
      style={{ background: "blue", color: "white", padding: "0.5rem 1rem" }}
      onClick={() => setCount((c) => c + 1)}
    >
      {label} ({count})
    </button>
  );
};
