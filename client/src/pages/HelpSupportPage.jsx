export default function HelpSupportPage() {
  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Help & Support</p>
          <h2>Need Assistance?</h2>
          <p className="muted">Quick guidance to use the platform and support contact details.</p>
        </div>
      </section>

      <section className="cards">
        <article className="card trip-card">
          <h3>How to plan a trip</h3>
          <p>Use Plan Trip, enter destination, dates, budget, and interests to generate your trip plan.</p>
        </article>
        <article className="card trip-card">
          <h3>Save places for later</h3>
          <p>Go to Saved Places and keep your favorite locations ready for upcoming trips.</p>
        </article>
        <article className="card trip-card">
          <h3>Contact support</h3>
          <p>Email: support@smarttourism.app</p>
          <p>Response time: within 24 hours on business days.</p>
        </article>
      </section>
    </main>
  );
}
