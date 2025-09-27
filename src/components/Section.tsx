import React from "react";

type SectionProps = { title: string; children: React.ReactNode; right?: React.ReactNode };

export const Section = ({ title, children, right }: SectionProps) => (
  <section className="sect">
    <div className="sect-head">
      <h3>{title}</h3>
      {right}
    </div>
    {children}
  </section>
);
