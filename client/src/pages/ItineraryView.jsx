import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../api";

function SortablePlace({ p }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: String(p.placeId) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article ref={setNodeRef} style={style} className="card itinerary-stop" {...attributes} {...listeners}>
      <strong>
        {p.sequence}. {p.placeName}
      </strong>
      <div className="muted">
        {p.cityTown} | {p.type} | {p.suggestedTime} | INR {p.budgetINR}
      </div>
    </article>
  );
}

export default function ItineraryView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [hotelLoading, setHotelLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/trips/${id}`);
    let nextTrip = data;

    // Backfill hotels for older trips that were generated before hotel recommendations existed.
    if (!Array.isArray(data.recommendedHotels) || data.recommendedHotels.length === 0) {
      try {
        setHotelLoading(true);
        const { data: hotelData } = await api.post(`/trips/${id}/recommend-hotels`);
        nextTrip = { ...data, recommendedHotels: hotelData.recommendedHotels || [] };
      } catch (_) {
        nextTrip = { ...data, recommendedHotels: [] };
      } finally {
        setHotelLoading(false);
      }
    } else {
      setHotelLoading(false);
    }

    setTrip(nextTrip);
    setActiveDay((prev) => (prev > 0 ? prev : 1));
  };

  useEffect(() => {
    load().catch(() => toast.error("Failed to load trip plan"));
  }, [id]);

  const day = useMemo(() => trip?.itinerary?.find((x) => x.day === activeDay), [trip, activeDay]);
  const sensors = useSensors(useSensor(PointerSensor));

  const saveOrder = async (orderedPlaceIds) => {
    await api.post(`/trips/${id}/replan?mode=manual`, { day: activeDay, orderedPlaceIds });
    await load();
  };

  const onDragEnd = async (event) => {
    if (!day) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.places.findIndex((p) => String(p.placeId) === String(active.id));
    const newIndex = day.places.findIndex((p) => String(p.placeId) === String(over.id));
    const next = arrayMove(day.places, oldIndex, newIndex);
    await saveOrder(next.map((p) => p.placeId));
  };

  const weatherReplan = async () => {
    await api.post(`/trips/${id}/replan?mode=weather`);
    await load();
    toast.success("Weather replan applied");
  };

  if (!trip) return <main className="container page">Loading...</main>;

  return (
    <main className="container page">
      <section className="section-head">
        <div>
          <p className="kicker">Trip Plan</p>
          <h2>{trip.destination}</h2>
          <p className="muted">
            {trip.startDate} to {trip.endDate}
          </p>
        </div>
        <button className="btn" onClick={weatherReplan}>
          Auto Update for Weather
        </button>
      </section>

      <section className="stats-row">
        <article className="card stat-card">
          <p>Total Distance</p>
          <strong>{trip.optimizationMeta?.totalDistanceKm || 0} km</strong>
        </article>
        <article className="card stat-card">
          <p>Total Travel Time</p>
          <strong>{trip.optimizationMeta?.totalTravelMinutes || 0} min</strong>
        </article>
      </section>

      <div className="day-tabs">
        {trip.itinerary.map((d) => (
          <button key={d.day} className={activeDay === d.day ? "btn" : "btn secondary"} onClick={() => setActiveDay(d.day)}>
            Day {d.day}
          </button>
        ))}
      </div>

      {day && (
        <section className="card itinerary-day">
          <h3>
            Day {day.day} ({day.date})
          </h3>
          <p className="muted">
            Budget INR {day.dayBudget} | Travel {day.travelDistance} km ({day.travelTimeMinutes} min)
          </p>
          {day.weatherNote && <p className="note">{day.weatherNote}</p>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={day.places.map((p) => String(p.placeId))} strategy={verticalListSortingStrategy}>
              {day.places.map((p, idx) => (
                <SortablePlace key={`${p.placeId}-${idx}`} p={p} />
              ))}
            </SortableContext>
          </DndContext>
        </section>
      )}

      <section className="card">
        <h3>Recommended Hotels</h3>
        {hotelLoading && <p className="muted">Finding best hotels for your destination and budget...</p>}
        {!hotelLoading && Array.isArray(trip.recommendedHotels) && trip.recommendedHotels.length === 0 && (
          <p className="muted">No direct hotel mapping found for this exact place. Try generating a new trip or a nearby destination name.</p>
        )}
        {!hotelLoading && Array.isArray(trip.recommendedHotels) && trip.recommendedHotels.length > 0 && (
          <>
            <p className="muted">Hotels are filtered for your destination and trip budget.</p>
            <div className="cards">
              {trip.recommendedHotels.map((hotel, idx) => (
                <article key={`${hotel.hotelId || hotel.name}-${idx}`} className="card trip-card">
                  <h4>{hotel.name}</h4>
                  <p className="muted">
                    {hotel.city}, {hotel.state}
                  </p>
                  <p>
                    INR {hotel.pricePerNight}/night | Rating {hotel.rating}
                  </p>
                  <p className="muted">Category: {hotel.category}</p>
                  {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                    <p className="muted">{hotel.amenities.slice(0, 4).join(" | ")}</p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
