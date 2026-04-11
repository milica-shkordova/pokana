import config from "@/config";

export default function Program() {
  return (
    <section className="inv__section" data-gsap="program">
      <p className="inv__label">Програма</p>
      <div className="inv__timeline">
        {config.program.map((event: { time: string; description: string }, i: number) => (
          <span key={i} className="inv__timeline-event">
            <span>{event.time}</span> &nbsp;-&nbsp; {event.description}&nbsp;
          </span>
        ))}
      </div>
    </section>
  );
}
