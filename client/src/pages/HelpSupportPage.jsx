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
          <p>Open Plan Trip from the navbar and type your destination city or state.</p>
          <p>Select start date and end date carefully so the planner can build daily stops correctly.</p>
          <p>Enter your total budget in INR, then choose interests like nature, food, adventure, or culture.</p>
          <p>Choose your travel style and click Generate Trip Plan to create your personalized itinerary.</p>
          <p>If generation fails, recheck destination spelling, dates, and internet connection, then try again.</p>
        </article>
        <article className="card trip-card">
          <h3>Save places for later</h3>
          <p>Visit Hidden Gems or Explore and review places by state, type, and search filters.</p>
          <p>Use Save Place to add locations to your personal Saved Places list.</p>
          <p>Open Saved Places anytime to review your shortlist and remove items you no longer need.</p>
          <p>Click a saved place card to view its description and use it while planning your trip.</p>
        </article>
        <article className="card trip-card">
          <h3>Use hidden gems effectively</h3>
          <p>Go to Hidden Gems and start with Search, State, and Preset filters.</p>
          <p>Try presets like Quiet, Photography, or Local food to quickly narrow recommendations.</p>
          <p>Click any place card to expand details and compare budget, duration, and rating.</p>
          <p>Use these results to pick less crowded places and add the best options to Saved Places.</p>
        </article>
        <article className="card trip-card">
          <h3>Manage generated itinerary</h3>
          <p>After creating a trip, open My Trips to view all your generated itineraries.</p>
          <p>Select a trip to inspect day-by-day stop recommendations and travel flow.</p>
          <p>Use saved places and hidden gems as references when deciding final stops for each day.</p>
          <p>Keep your budget in mind and revisit the planner if you need a different trip style.</p>
        </article>
        <article className="card trip-card">
          <h3>Weather and timing checks</h3>
          <p>Use Weather to check current and upcoming conditions for your destination.</p>
          <p>Review weather before finalizing your plan, especially for outdoor activities.</p>
          <p>If heavy rain or heat is expected, replace outdoor stops with indoor alternatives.</p>
          <p>Do a final weather check one day before departure for last-minute adjustments.</p>
        </article>
        <article className="card trip-card">
          <h3>Common issues and quick fixes</h3>
          <p>If places do not load, confirm backend server is running and database is connected.</p>
          <p>If trip generation fails, refresh once and submit again after checking required fields.</p>
          <p>If saved places are missing, verify you are in the same browser profile and session.</p>
          <p>If login issues occur, sign out, sign in again, and retry your previous action.</p>
        </article>
        <article className="card trip-card">
          <h3>Contact support</h3>
          <p>Email: support@smarttourism.app</p>
          <p>Response time: within 24 hours on business days.</p>
          <p>Include your issue, page name, and exact error message for faster resolution.</p>
          <p>Attach a screenshot and steps to reproduce so support can help you quickly.</p>
        </article>
      </section>
    </main>
  );
}
