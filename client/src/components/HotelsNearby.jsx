import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import "../styles/HotelsNearby.css";

export default function HotelsNearby({ gem, budget }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const hotelsCacheRef = useRef(new Map());

  const queryString = useMemo(() => {
    if (!gem || !gem.latitude || !gem.longitude) {
      return "";
    }

    const budgetNumber = Number(budget) || 50000;
    const maxPrice = Math.min(Math.max(budgetNumber * 0.3, 1000), 8000);

    const params = new URLSearchParams({
      latitude: gem.latitude,
      longitude: gem.longitude,
      maxDistance: 15,
      maxPrice: Math.floor(maxPrice),
      minRating: 3,
      sortBy
    });

    if (categoryFilter) {
      params.set("category", categoryFilter);
    }

    return params.toString();
  }, [gem?.latitude, gem?.longitude, budget, categoryFilter, sortBy]);

  useEffect(() => {
    setSelectedHotel(null);
  }, [gem?._id]);

  useEffect(() => {
    if (!gem || !gem.latitude || !gem.longitude) {
      setError("Invalid gem location data");
      return;
    }

    if (!queryString) {
      return;
    }

    const controller = new AbortController();

    const loadHotels = async () => {
      const cached = hotelsCacheRef.current.get(queryString);
      if (cached) {
        setError(null);
        setHotels(cached);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get(`/hotels/near-gem?${queryString}`, {
          signal: controller.signal
        });

        hotelsCacheRef.current.set(queryString, data);
        setHotels(data);

        if (data.length === 0) {
          toast.error("No hotels found within budget near this gem");
        }
      } catch (err) {
        if (err?.code === "ERR_CANCELED") return;
        setError("Failed to load hotels. Please try again.");
        toast.error("Failed to load hotels");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadHotels();

    return () => {
      controller.abort();
    };
  }, [gem?._id, gem?.latitude, gem?.longitude, queryString]);

  if (!gem) {
    return null;
  }

  return (
    <div className="hotels-nearby-section">
      <div className="hotels-header">
        <h3>
          {"\uD83C\uDFE8"} Hotels Near {gem.placeTown}
        </h3>
        <p className="hotels-subtitle">
          Within {"\u20B9"}
          {Math.floor(budget * 0.3)}/night budget, within 15km radius
        </p>
      </div>

      {error && (
        <div className="hotels-error">
          <p>
            {"\u26A0\uFE0F"} {error}
          </p>
        </div>
      )}

      {loading && (
        <div className="hotels-loading">
          <p>
            {"\uD83D\uDD04"} Finding hotels near {gem.placeTown}...
          </p>
        </div>
      )}

      {!loading && hotels.length > 0 && (
        <div className="hotels-controls">
          <div className="filter-group">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-Range</option>
              <option value="luxury">Luxury</option>
              <option value="luxury-plus">Luxury+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="distance">Nearest First</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>

          <div className="hotels-count">
            Found {hotels.length} hotel{hotels.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {!loading && hotels.length === 0 && !error && (
        <div className="hotels-empty">
          <p>No hotels found matching your criteria near this gem.</p>
        </div>
      )}

      <div className="hotels-list">
        {hotels.map((hotel) => (
          <div
            key={hotel._id}
            className="hotel-card"
            onClick={() => setSelectedHotel(selectedHotel?._id === hotel._id ? null : hotel)}
          >
            <div className="hotel-header">
              <div className="hotel-title-section">
                <h4>{hotel.name}</h4>
                <span className={`category-badge ${hotel.category}`}>{hotel.category}</span>
              </div>
              <div className="hotel-rating">
                <span className="stars">
                  {"\u2B50"} {hotel.rating}
                </span>
              </div>
            </div>

            <div className="hotel-info">
              <div className="info-item">
                <span className="label">Distance:</span>
                <span className="value">{hotel.distance?.toFixed(1)}km</span>
              </div>
              <div className="info-item">
                <span className="label">Price/Night:</span>
                <span className="value price">
                  {"\u20B9"}
                  {hotel.pricePerNight}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Location:</span>
                <span className="value">{hotel.city}, {hotel.state}</span>
              </div>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="hotel-amenities">
                {hotel.amenities.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 3 && <span className="amenity-tag more">+{hotel.amenities.length - 3}</span>}
              </div>
            )}

            {selectedHotel?._id === hotel._id && (
              <div className="hotel-details">
                <p className="description">{hotel.description}</p>

                {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                  <div className="room-types">
                    <h5>Available Room Types:</h5>
                    <div className="rooms-grid">
                      {hotel.roomTypes.map((room, i) => (
                        <div key={i} className="room-type">
                          <span className="room-name">{room.type}</span>
                          <span className="room-price">
                            {"\u20B9"}
                            {room.basePrice}
                          </span>
                          <span className="room-capacity">2-{room.capacity} guests</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="all-amenities">
                    <h5>Amenities:</h5>
                    <div className="amenities-list">
                      {hotel.amenities.map((amenity, i) => (
                        <span key={i}>
                          {"\u2713"} {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hotel-actions">
                  {hotel.phone && (
                    <a href={`tel:${hotel.phone}`} className="btn btn-small">
                      {"\uD83D\uDCDE"} Call
                    </a>
                  )}
                  {hotel.email && (
                    <a href={`mailto:${hotel.email}`} className="btn btn-small">
                      {"\uD83D\uDCE7"} Email
                    </a>
                  )}
                  {hotel.website && (
                    <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="btn btn-small">
                      {"\uD83C\uDF10"} Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
