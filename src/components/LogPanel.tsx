import React from "react";

export const LogPanel = ({ log }: { log: string[] }) => (
  <aside className="log">
    <h4>Action Log</h4>
    <ul>
      {log.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  </aside>
);
